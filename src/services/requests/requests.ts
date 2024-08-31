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
const moment = require("moment");
import { Termii } from "../../helpers/termii";
import { HookContext } from "@feathersjs/feathers";
import { hooks as schemaHooks } from "@feathersjs/schema";
import { Request, Response } from "express";
import { constants } from "../../helpers/constants";
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
import {
  RequestStatus,
  DispatchApprovalStatus,
} from "../../interfaces/constants";
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
const Pusher = require("pusher");

const estimatesRide = "estimates/ride";

const pusher = new Pusher({
  appId: "1855995",
  key: "b61b69474645901192ed",
  secret: "b8da7e509616474805d1",
  cluster: "mt1",
  useTLS: true,
});

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
  const options = getOptions(app)
  app.use(requestsPath,  new RequestsService(options, app), {
    methods: requestsMethods,
    events: ["new-delivery-requests"],
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
              // logger.info(
              //   `running background job for new delivery request of id : ${job.data.id} with job id: ${job.id} `
              // );
              context.service.emit("new-delivery-requests", {
                message: "Incoming delivery request",
                data: job.data,
              });
  
              //use knex
              // Query for suitable riders
              const suitableRidersData = await app.service("dispatch").find({
                query: {
                  // isAcceptingPickUps: true,
                  // onTrip: false,
                  // approval_status: DispatchApprovalStatus.Approved,
                  $sort: {
                    id: 1,
                  },
                  $limit: 50, // Adjust this number as needed
                },
              });
  
              // logger.info(
              //   //@ts-ignore
              //   ` number  of suitable Riders: ${suitableRidersData.data.length} `
              // );
  
              if (!suitableRidersData.data.length) {
                pusher.trigger(`dispatch-channel`, "no-dispatch-available", {
                  message: "No dispatch available",
                  requestid: context.result.id,
                });
  
                if (job?.id) return await dispatchRequestQueue.remove(job?.id);
              }
  
              const suitableRiders = suitableRidersData.data;
  
              const messageToRiders = `Incoming request from ${user.first_name}:  (${job.data.pickup_address} - ${job.data.delivery_address}), ${moment(job.data.createdAt).format("h:mm:ss a")} on ${moment(job.data.createdAt).format("MMMM Do YYYY")}`;
  
              //**********send sms */
              const suitableRidersPhoneNumbers = suitableRiders.map(
                //@ts-ignore
                (eachRider) => eachRider?.phone_number
              );
              // const termii = new Termii();
              // await termii.sendBatchSMS(
              //   suitableRidersPhoneNumbers,
              //   messageToRiders
              // );
              //**********send sms */
  
              //**********send onse signal */
              const suitableRidersOneSingalAlias = suitableRiders
                //@ts-ignore
                .map((eachRider) => eachRider?.one_signal_alias)
                .filter((id) => id !== null && id !== undefined);
  
              const dataForPushNotification = {
                timeToUser: 10,
                amountFrom: 0,
                amountTo: job.data.delivery_price_details.totalPrice,
                pickUpAddress:  job.data.pickup_address,
                dropOffAddress: job.data.delivery_address,
                currency: "N",
                paymentType: "Cash",
                ...job.data
              };
  
              // console.log(job.data)
              // {
              //   id: 122,
              //   requester: 105,
              //   pickup_gps_location: { latitude: 6.5689, longitude: 3.3827 },
              //   pickup_address: 'no 3 aso rock',
              //   delivery_address: 'no 5 ojodu road',
              //   delivery_gps_location: { latitude: 6.6201, longitude: 3.3683 },
              //   scheduled: false,
              //   delivery_instructions: 'drop it gently',
              //   delivery_method: 1,
              //   estimated_distance: '9.00',
              //   estimated_delivery_time: '43.00',
              //   package_details: {
              //     weight: 0,
              //     quantity: 0,
              //     description: 'Fragile items, handle with care',
              //     image: 'https://example.com/image.jpg',
              //     estimated_worth: 0
              //   },
              //   status: 'pending',
              //   dispatch: null,
              //   delivery_price_details: {
              //     totalPrice: 2174,
              //     feeForKm: 45,
              //     feeForTime: 129,
              //     baseFeePerKm: 5,
              //     baseFeePerMin: 3
              //   }
              // }
  
              await sendPush(
                "dispatch",
                messageToRiders,
                suitableRidersOneSingalAlias,
                dataForPushNotification,
                true
              );
              //**********send onse signal */
            },
            connectionObject
          );
        },

      ]
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
