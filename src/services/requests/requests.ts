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
import moment from 'moment';
import { nanoid } from 'nanoid';


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
import {
  RequestStatus,
  DispatchApprovalStatus,
} from "../../interfaces/constants";
import { Queue, Worker } from "bullmq";

import { app } from "../../app";
import { addDispatchRequestJob, addScheduledDeliveryJob } from "../../queue/request";
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

const { BadRequest, Forbidden } = require("@feathersjs/errors");

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

const validateScheduledDelivery = async (context: HookContext) => {
  const { scheduled, scheduled_time } = context.data;
  const userId = context.params.user.id;

  if (scheduled) {
    if (!scheduled_time) {
      throw new BadRequest('Scheduled time is required for scheduled deliveries');
    }

    const scheduledMoment = moment(scheduled_time);
    const currentMoment = moment();

    if (scheduledMoment.isBefore(currentMoment.add(30, 'minutes'))) {
      throw new BadRequest('Scheduled time must be at least 30 minutes from now');
    }

    const knex = context.app.get("postgresqlClient");
    const existingScheduledDeliveries = await knex('requests')
      .where({
        requester: userId,
        scheduled: true
      })
      .whereIn('status', [RequestStatus.Pending, RequestStatus.Accepted])
      .count('id as count')
      .first();

    if (existingScheduledDeliveries.count > 0) {
      throw new Forbidden('You can only have one scheduled delivery at a time');
    }
  }

  return context;
}

// A configure function that registers the service and its hooks via `app.configure`
export const requests = (app: Application) => {
  const options = getOptions(app);
  app.use(requestsPath, new RequestsService(options, app), {
    methods: requestsMethods,
    events: [
      textConstant.noDispatchAvailable,
      textConstant.requestAcceptedByDispatch,
      textConstant.locationUpdateDispatch,
      textConstant.locationUpdateRequester,
      textConstant.requestCancelledByRequester,
      textConstant.deliveryUpdate
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
            ...context.params.query,
            //@ts-ignore
            requester: user.id,
          };
          return context;
        },
      ],
      get: [],
      create: [
        isVerified(),
        validateScheduledDelivery,
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

            const trackingId = nanoid(10);  // Generates a 10-character long ID

          context.data = {
            ...context.data,
            //@ts-ignore
            requester: context?.params?.user?.id,
            status: RequestStatus.Pending,
            delivery_price_details: result.data.priceDetails,
            estimated_distance: result.data.distance,
           tracking_id: trackingId,  

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

          if (context.result.scheduled) {
            await addScheduledDeliveryJob(context.result);
          }else{
            addDispatchRequestJob(context.result);
          }
         
        },
      ],

      find: [
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
