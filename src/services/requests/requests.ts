// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from "@feathersjs/authentication";
import {
  isVerified,
  calculatePrice,
  validateLatLongObject,
  checkDistanceAndTimeUsingLongLat,
  successResponse,
  successResponseWithPagination,
} from "../../helpers/functions";
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

import type { Application } from "../../declarations";
import { RequestsService, getOptions, TripEstimateService } from "./requests.class";
import { requestsPath, requestsMethods } from "./requests.shared";

export * from "./requests.class";
export * from "./requests.schema";
const { GeneralError } = require("@feathersjs/errors");

// A configure function that registers the service and its hooks via `app.configure`
export const requests = (app: Application) => {
  const options_ = getOptions(app)

  // Register our service on the Feathers application
  app.use(requestsPath, new RequestsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: requestsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });

  // {
  //   async create(body: any) {
  //     return successResponse(
  //       body,
  //       200,
  //       "Successfully retrieved trip estimate!"
  //     );
  //   },
  // }
 
  //@ts-ignore
  app .use(`estimates/ride`, new TripEstimateService(options_, app))
    // .hooks({
    //   before: {
    //     all: [
    //       authenticate("jwt")
    //     ],
    //     create: [
    //       async (context) => {
    //         const { origin, destination } = context.data;

    //         if (
    //           !validateLatLongObject(origin) ||
    //           !validateLatLongObject(destination)
    //         ) {
    //           throw new GeneralError(
    //             "Both origin and destination must be objects with latitude and longitude as numbers."
    //           );
    //         }

    //         const distanceResult = await checkDistanceAndTimeUsingLongLat(
    //           origin,
    //           destination
    //         );
    //         if (distanceResult && distanceResult.status === "OK") {
    //           const time = Math.round(
    //             distanceResult.routes[0].legs[0].duration_in_traffic.value / 60
    //           );
    //           const distance = Math.round(
    //             distanceResult.routes[0].legs[0].distance.value / 1000
    //           );

    //           const settings = {
    //             baseFare: constants.whiteLabelAminBaseFee,
    //             ratePerKilometer: constants.feePerKm,
    //             ratePerMinute: constants.feePerMin,
    //           };

    //           const price = await calculatePrice(distance, time, settings);

    //           //@ts-ignore
    //           context.data = {
    //             ...context.data,
    //             priceDetails: {
    //               totalPrice: price,
    //               feeForKm: distance * constants.feePerKm,
    //               feeForTime: time * constants.feePerMin,
    //               baseFeePerKm: constants.feePerKm,
    //               baseFeePerMin: constants.feePerMin,
    //             },
    //             time,
    //             distance,
    //           };
    //           return context;
    //         }
    //       },
    //     ],
    //   },
    // });

  // Initialize hooks
  app.service(requestsPath).hooks({
    before: {
      all: [
        authenticate("jwt"),
        schemaHooks.validateQuery(requestsQueryValidator),
        schemaHooks.resolveQuery(requestsQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        isVerified(),
        schemaHooks.validateData(requestsDataValidator),
        schemaHooks.resolveData(requestsDataResolver),
        // async context => {
        //   // eslint-disable-next-line no-useless-catch
        //   try {
        //     const dat = context.data;
        //     if (dat.paymentMode === 'wallet' || dat.paymentMode === 'Wallet') {
        //       const WALLET = context.app.service('wallets');
        //       const checkWallet =  await WALLET.Model.findOne({user: dat.user});
        //       if (checkWallet && checkWallet.balance >= dat.paymentAmount) {
        //         await WALLET.Model.findOneAndUpdate({user: dat.user}, { $inc: { balance: -dat.paymentAmount }, user: dat.user}, {
        //           new: true
        //         });
        //       } else {
        //         throw new Forbidden('Insufficient Balance');
        //       }
        //     }
        //     const TRANSACTION = context.app.service('transactions');
        //     await TRANSACTION.create({
        //       type: (dat.paymentMode === 'wallet' || dat.paymentMode === 'Wallet') ? 'Wallet' : (dat.paymentMode || 'Cash'),
        //       action: 'Debit',
        //       amount: dat.paymentAmount,
        //       status:  true,
        //       trackingId: dat.paymentRef,
        //       isDelivery: true,
        //       user: dat.user,
        //       pickUpAddress: dat.pickUpAddress,
        //       deliveryAddress: dat.deliveryAddress
        //     });
        //     const status = await context.app.service('orderstatus').create({status: 'Pending'});
        //     dat.status = status._id;
        //     dat.trackingId = await generateTrackingId(10);
        //     return context;
        //   } catch (error) {
        //     throw error;
        //   }
        // }
      ],
      patch: [
        schemaHooks.validateData(requestsPatchValidator),
        schemaHooks.resolveData(requestsPatchResolver),
      ],
      remove: [],
    },
    after: {
      all: [],
      create: [
        async (context) => {
          // const dat = context.result;
          // if(dat.paymentRef){
          //   const pay = await checkPaystackPayment(dat.paymentRef);
          // }
          // const now = moment().format('YYYY-MM-DD');
          // const deliveryDate = moment(context.result && context.result.deliveryDate).format('YYYY-MM-DD');
          // const sameDay = now === deliveryDate;
          // if(dat.deliveryMethod !== 'Van' && dat.deliveryMethod !== 'Truck' && sameDay){
          //   context.service.emit('newDelivery', { message: 'Incoming delivery request', data: context.result });
          // }else if(!sameDay || context.result.scheduled) {
          //   const request = context.result;
          //   pushScheduleQueue(request);
          // }
          // context.service.emit('newDelivery', { message: 'Incoming delivery request', data: context.result });
          return context;
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
  }
}
