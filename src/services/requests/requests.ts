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
import moment from "moment";
import * as crypto from "crypto";
import { HookContext, Params } from "@feathersjs/feathers";
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
  RequestPaymentMethod,
} from "../../interfaces/constants";
import { Queue, Worker } from "bullmq";

import { app } from "../../app";
import {
  addDispatchRequestJob,
  addScheduledDeliveryJob,
} from "../../queue/request";
import { logger } from "../../logger";
import type { Application } from "../../declarations";
import {
  RequestsService,
  getOptions,
  TripEstimateService,
} from "./requests.class";
import { requestsPath, requestsMethods } from "./requests.shared";
import { GeneralError } from "@feathersjs/errors";

import { Wallet } from "../wallet/wallet.schema";

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
      throw new BadRequest(
        "Scheduled time is required for scheduled deliveries"
      );
    }

    const scheduledMoment = moment(scheduled_time);
    const currentMoment = moment();

    if (scheduledMoment.isBefore(currentMoment.add(30, "minutes"))) {
      throw new BadRequest(
        "Scheduled time must be at least 30 minutes from now"
      );
    }

    const knex = context.app.get("postgresqlClient");
    const existingScheduledDeliveries = await knex("requests")
      .where({
        requester: userId,
        scheduled: true,
      })
      .whereIn("status", [RequestStatus.Pending, RequestStatus.Accepted])
      .count("id as count")
      .first();

    if (existingScheduledDeliveries.count > 0) {
      throw new Forbidden("You can only have one scheduled delivery at a time");
    }
  }

  return context;
};

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
      textConstant.deliveryUpdate,
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
          //@ts-ignore
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
        // generateTrackingId,
        async (context) => {
          //@ts-ignore
          const user_id = context?.params?.user.id;

          const tripLocationDetails = {
            //@ts-ignore
            origin: context.data.pickup_gps_location,
            //@ts-ignore
            destination: context.data.delivery_gps_location,
          };
          const result = await app
            .service(estimatesRide)
            .create(tripLocationDetails);

          //@ts-ignore
          const payment_method = context?.data?.payment_method;
          if (!payment_method) {
            //@ts-ignore
            context.data.payment_method = RequestPaymentMethod.cash;
          }

          if (payment_method === RequestPaymentMethod.wallet) {
            const walletService = context.app.service("wallet");

            let walletResult = await walletService.find({
              //@ts-ignore
              query: { user_id },
            });

            let wallet: Wallet | null = null;

            if (walletResult.data.length === 0) {
              // If no wallet exists, create a new one
              wallet = await walletService.create({
                user_id,
                balance: 0.0, // New wallet starts with a balance of 0
              });
            } else {
              // Use the existing wallet
              wallet = walletResult.data[0];
            }


            const knex = context.app.get("postgresqlClient");
            const pendingRequests = await knex("requests")
              .where({
                requester: user_id,
                payment_method: RequestPaymentMethod.wallet,
              })
              .whereIn("status", [
                RequestStatus.Accepted,
                RequestStatus.EnrouteToPickUp,
                RequestStatus.EnrouteToDropOff,
              ]);

            // Calculate total cost of pending requests
            const totalPendingCost = pendingRequests.reduce(
              (sum, request) => sum + request.delivery_price_details.totalPrice,
              0
            );

            // Check if wallet has enough funds for all pending requests plus this new request
            if (
              wallet.balance <
              totalPendingCost + result.data.priceDetails.totalPrice
            ) {
              throw new BadRequest(
                "Insufficient funds in wallet, fund your wallet to get requests"
              );
            }
          }

          //@ts-ignore
          context.data = {
            ...context.data,
            requester: user_id,
            status: RequestStatus.Pending,
            delivery_price_details: result.data.priceDetails,
            estimated_distance: result.data.distance,
            tracking_id: crypto.randomBytes(8).toString("hex"),
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
          } else {
            addDispatchRequestJob(context.result);
          }
        },
      ],

      find: [],
    },
    error: {
      all: [],
    },
  });

  //@ts-ignore
  app.use(`${requestsPath}/tracking/:trackingId`, {
    async find(params: Params) {
      const trackingId = params?.route?.trackingId;
      const requestService = app.service("requests");
      //@ts-ignore
      return await requestService.getByTrackingId(trackingId);
    },
  });

 //@ts-ignore
  app.get('/request-package-types', (req, res) => {
    const popularPackageTypes = [
      { id: 1, name: 'Food', description: 'Meals, groceries, etc.' },
      { id: 2, name: 'Perishables', description: 'Items that can spoil or decay' },
      { id: 3, name: 'Gadgets', description: 'Electronics, phones, laptops, etc.' },
      { id: 4, name: 'Documents', description: 'Papers, contracts, certificates' },
      { id: 5, name: 'Clothing', description: 'Apparel and accessories' },
      { id: 6, name: 'Fragile Items', description: 'Glassware, antiques, etc.' },
      { id: 7, name: 'Medical Supplies', description: 'Medicines, equipment' },
      { id: 8, name: 'Books', description: 'Textbooks, novels, magazines' },
      { id: 9, name: 'Gifts', description: 'Presents, flowers, gift baskets' },
      { id: 10, name: 'Other', description: 'Miscellaneous items' }
    ];

    try {
      res.json({
        status: 200,
        success: true,
        message: 'Package types retrieved successfully',
        data: popularPackageTypes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving package types',
         //@ts-ignore
        error: error?.message
      });
    }
  });
};

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    [requestsPath]: RequestsService;
    [estimatesRide]: TripEstimateService;
  }
}
