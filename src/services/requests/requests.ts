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
  useTLS: true
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
            logger.error({ result: distanceResult, message: 'google api to generate estimate failling' })
            throw new GeneralError("Failed to get trip price and distance estimate, Try again");
          }
        },
      ],
    },
  });
};

// A configure function that registers the service and its hooks via `app.configure`
export const requests = (app: Application) => {

  // Register our service on the Feathers application
  app.use(requestsPath, new RequestsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: requestsMethods,
    // You can add additional custom events to be sent to clients here
    events: ["new-delivery-requests"],
  });

  // Initialize hooks
  app.service(requestsPath).hooks({
    before: {
      all: [
        authenticate("jwt"),
        schemaHooks.validateQuery(requestsQueryValidator),
        schemaHooks.resolveQuery(requestsQueryResolver),
      ],
      find: [
        async (context) => {
          const user = context.params.user; // Get authenticated user from context
         
          context.params.query = {
            //@ts-ignore
            requester: user.id,
          }
          return context;
        }
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
      async create(context: HookContext) {
       const jobRunning = await dispatchRequestQueue.add("new-req", context.result);

        const worker = new Worker(
          newDispatchRequest,
          async (job) => {
    
            logger.info(
              `running background job for new delivery request of id : ${job.data.id} with job id: ${job.id} `
            );
            // context.service.emit("new-delivery-requests", {
            //   message: "Incoming delivery request",
            //   data: job.data,
            // });

            // Query for suitable riders
            const suitableRidersData = await app.service("dispatch").find({
              query: {
                isAcceptingPickUps: true,
                // onTrip: false,
                // approval_status: DispatchApprovalStatus.Approved,
                $sort: {
                  id: 1,
                },
                $limit: 50, // Adjust this number as needed
              },
            });

            logger.info( //@ts-ignore
              ` number  of suitable Riders: ${suitableRidersData.length} `
            );

            // console.log(job.id, suitableRidersData.data, context.result.id)

            if (!suitableRidersData.data.length) {
              pusher.trigger(
                `dispatch-channel`,
                "no-dispatch-available",
                {
                  message: "No dispatch available",
                  requestid : context.result.id
                }
              );

              if(job?.id) return await dispatchRequestQueue.remove(job?.id);
            }

            const suitableRiders = suitableRidersData.data;

            //**********send sms */
            const suitableRidersPhoneNumbers = suitableRiders.map(
              //@ts-ignore
              (eachRider) => eachRider?.phone_number
            );

            const messageToRiders = `helllo`;

            // const termii = new Termii();
            // await termii.sendBatchSMS(suitableRidersPhoneNumbers, messageToRiders);
            //**********send sms */

            //**********send onse signal */
            const suitableRidersOneSingalIds = suitableRiders
              //@ts-ignore
              .map((eachRider) => eachRider?.one_signal_player_id)
              .filter((id) => id !== null && id !== undefined);

            const msg = `You have been assigned to pick up a delivery from biola`;
            // context.result,
            await sendPush(
              "dispatch",
              msg,
              suitableRidersOneSingalIds,
              { name: "biola" },
              true
            );
            //**********send onse signal */

            //********** alert dispatch riders  */
            suitableRiders.forEach((rider) => {
              console.log(rider, ".......");
              pusher.trigger(
                `newDeliveryRequest-${rider.id}`,
                "new-delivery-request",
                {
                  message: "hello world",
                }
              );
            });
            //********** alert dispatch riders  */

          },
          connectionObject
        );
      },
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
