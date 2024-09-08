// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from "@feathersjs/authentication";
import {
  isVerified,
  calculatePrice,
  validateLatLongObject,
  checkDistanceAndTimeUsingLongLat,
  successResponse,
  successResponseWithPagination,
  sendSms,
  sendPush,
} from "../../helpers/functions";
import { client } from "../../app";

const moment = require("moment");
import { Termii } from "../../helpers/termii";
import { HookContext } from "@feathersjs/feathers";
import { hooks as schemaHooks } from "@feathersjs/schema";
import { Request, Response } from "express";
import { constants } from "../../helpers/constants";
import textConstant from "../../helpers/textConstant";
import {
  requestsDataValidator,
  requestsPatchValidator,
  requestsQueryValidator,
  requestsResolver,
  requestsExternalResolver,
  requestsDataResolver,
  requestsPatchResolver,
  requestsQueryResolver,
} from "./requests.schema";
import { RequestStatus, DispatchApprovalStatus  } from "../../interfaces/constants";
import { Queue, Worker } from "bullmq";
import {
  dispatchRequestQueue,
  generateJobName,
  newDispatchRequest,
  connectionObject,
} from "../../queue";
import { app } from "../../app";
import { logger } from "../../logger";
import type { Application } from "../../declarations";
import {
  RequestsService,
  getOptions,
  TripEstimateService,
} from "./requests.class";
import { requestsPath, requestsMethods } from "./requests.shared";
import { GeneralError } from "@feathersjs/errors";

export * from "./requests.class";
export * from "./requests.schema";

const { BadRequest } = require("@feathersjs/errors");

const estimatesRide = "estimates/ride";

export const tripEstimates = (app: Application) => {
  const options_ = getOptions(app);
  //@ts-ignore
  app.use(estimatesRide, new TripEstimateService(options_, app), {
    // A list of all methods this service exposes externally
    methods: ["create"],
    // You can add additional custom events to be sent to clients here
    events: [],
  });

  app.service(estimatesRide).hooks({
    before: {
      all: [authenticate("jwt"), isVerified()],
      create: [
        async (context) => {
          const { origin, destination } = context.data;

          if (
            !validateLatLongObject(origin) ||
            !validateLatLongObject(destination)
          ) {
            throw new BadRequest(
              "Both origin and destination must be objects with latitude and longitude as numbers."
            );
          }

          const distanceResult = await checkDistanceAndTimeUsingLongLat(
            origin,
            destination
          );
          if (distanceResult && distanceResult.status === "OK") {
            const time = Math.round(
              distanceResult.routes[0].legs[0].duration_in_traffic.value / 60
            );
            const distance = Math.round(
              distanceResult.routes[0].legs[0].distance.value / 1000
            );

            const settings = {
              baseFare: constants.whiteLabelAminBaseFee,
              ratePerKilometer: constants.feePerKm,
              ratePerMinute: constants.feePerMin,
            };

            const price = await calculatePrice(distance, time, settings);

            //@ts-ignore
            context.data = {
              ...context.data,
              priceDetails: {
                totalPrice: price,
                feeForKm: distance * constants.feePerKm,
                feeForTime: time * constants.feePerMin,
                baseFeePerKm: constants.feePerKm,
                baseFeePerMin: constants.feePerMin,
                currency: "NGN",
              },
              time,
              distance,
            };
            return context;
          } else {
            logger.error({
              result: distanceResult,
              message: "google api to generate estimate failling",
            });
            throw new GeneralError(
              "Failed to get trip price and distance estimate, Try again"
            );
          }
        },
      ],
    },
  });
};

// A configure function that registers the service and its hooks via `app.configure`
export const requests = (app: Application) => {
  const options = getOptions(app);
  app.use(requestsPath, new RequestsService(options, app), {
    methods: requestsMethods,
    events: [
      textConstant.noDispatchAvailable,
      textConstant.requestAcceptedByDispatch,
    ],
  });

  // Initialize hooks
  app.service(requestsPath).hooks({
    before: {
      all: [
        authenticate("jwt"),
        // schemaHooks.validateQuery(requestsQueryValidator),
        // schemaHooks.resolveQuery(requestsQueryResolver),
      ],
      find: [
        async (context) => {
          const user = context.params.user; // Get authenticated user from context

          context.params.query = {
            //@ts-ignore
            requester: user.id,
          };
          return context;
        },
      ],
      get: [],
      create: [
        isVerified(),
        async (context) => {
          const tripLocationDetails = {
            //@ts-ignore
            origin: context.data.pickup_gps_location,
            //@ts-ignore
            destination: context.data.delivery_gps_location,
          };
          const result = await app
            .service(estimatesRide)
            .create(tripLocationDetails);

          context.data = {
            ...context.data,
            //@ts-ignore
            requester: context?.params?.user?.id,
            status: RequestStatus.Pending,
            delivery_price_details: result.data.priceDetails,
            estimated_distance: result.data.distance,
            estimated_delivery_time: result.data.time,
          };
          return context;
        },

        schemaHooks.validateData(requestsDataValidator),
        schemaHooks.resolveData(requestsDataResolver),
      ],
      patch: [
        schemaHooks.validateData(requestsPatchValidator),
        schemaHooks.resolveData(requestsPatchResolver),
      ],
      remove: [],
    },
    after: {
      create: [
        async (context: HookContext) => {
          const user = context.params.user;

          await dispatchRequestQueue.add("new-req", context.result);

          new Worker(
            newDispatchRequest,
            async (job) => {
              logger.info(
                `running background job for new delivery request of id : ${job.data.id} with job id: ${job.id} `
              );

              const knex = app.get("postgresqlClient");
              const suitableRidersData = await knex("dispatch")
                .join("users", "dispatch.user_id", "users.id")
                .select(
                  "users.phone_number",
                  "users.first_name",
                  "users.last_name",
                  "users.one_signal_player_id",
                  "users.one_signal_alias",
                  "dispatch.address",
                  "dispatch.city",
                  "dispatch.state",
                  "dispatch.lga",
                  "dispatch.country",
                  "dispatch.available_days",
                  "dispatch.available_time_frames",
                  "dispatch.id",
                  "dispatch.onTrip",
                  "dispatch.isAcceptingPickUps",
                  "dispatch.user_id",
                )
                .where({
                  // isAcceptingPickUps: true, // Add necessary conditions here
                  // onTrip: false,
                  // approval_status: DispatchApprovalStatus.Approved,
                })
                .orderBy("id", "asc")
                .limit(50);

              if (!suitableRidersData || !suitableRidersData.length) {
                context.service.emit(textConstant.noDispatchAvailable, {
                  message: textConstant.english.noDispatchAvailableMessage,
                  data: job.data,
                });
                if (job?.id) return await dispatchRequestQueue.remove(job?.id);
                return;
              }

              const smsMessageDetails = {
                name: user.first_name,
                pickup_address: job.data.pickup_address,
                delivery_address: job.data.delivery_address,
                hour_time: moment(job.data.createdAt).format("h:mm:ss a"),
                month_time: moment(job.data.createdAt).format("MMMM Do YYYY"),
              };

              const messageToRiders =
                textConstant.english.messageToRiders(smsMessageDetails);

              //**********send sms */
              // const suitableRidersPhoneNumbers = suitableRidersData.map(
              //   //@ts-ignore
              //   (eachRider) => eachRider?.phone_number
              // );
              // const termii = new Termii();
              // await termii.sendBatchSMS(
              //   suitableRidersPhoneNumbers,
              //   messageToRiders
              // );
              //**********send sms */

             const dispatchPoolUserIds = suitableRidersData.map((eachRider) => eachRider?.user_id)

             client.set(`${textConstant.requests}-dispatch-pool-${job.data.id}`, JSON.stringify(dispatchPoolUserIds))

              //**********send onse signal */
              const suitableRidersOneSingalAlias = suitableRidersData
                //@ts-ignore
                .map((eachRider) => eachRider?.one_signal_alias)
                .filter((id) => id !== null && id !== undefined);

              const dataForPushNotification = {
                timeToUser: 10,
                amountFrom: 0,
                amountTo: job.data.delivery_price_details.totalPrice,
                pickUpAddress: job.data.pickup_address,
                dropOffAddress: job.data.delivery_address,
                currency: "N",
                paymentType: "Cash",
                ...job.data,
              };

              await sendPush(
                "dispatch",
                textConstant.english.new_dispatch_push_notification_heading,
                suitableRidersOneSingalAlias,
                dataForPushNotification,
                true
              );
               //**********send onse signal */
          
            },
            connectionObject
          );
        },
      ],
    },
    error: {
      all: [],
    },
  });
};

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    [requestsPath]: RequestsService;
    [estimatesRide]: TripEstimateService;
  }
}
