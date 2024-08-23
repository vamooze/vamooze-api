// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from "@feathersjs/feathers";
import { KnexService } from "@feathersjs/knex";
import type { KnexAdapterParams, KnexAdapterOptions } from "@feathersjs/knex";

import type { Application } from "../../declarations";
import type {
  Requests,
  RequestsData,
  RequestsPatch,
  RequestsQuery,
} from "./requests.schema";

export type { Requests, RequestsData, RequestsPatch, RequestsQuery };

export interface RequestsParams extends KnexAdapterParams<RequestsQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class RequestsService<
  ServiceParams extends Params = RequestsParams,
> extends KnexService<Requests, RequestsData, RequestsParams, RequestsPatch> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get("paginate"),
    Model: app.get("postgresqlClient"),
    name: "requests",
  };
};

export class TripEstimateService<
  ServiceParams extends Params = RequestsParams,
> extends KnexService<Requests, RequestsData, RequestsParams, RequestsPatch> {
  constructor(options: KnexAdapterOptions, app: Application) {
    super(options);
    //@ts-ignore
    this.app = app;
  }

  //@ts-ignore
  async create(data, params) {
    return {
      status: 200,
      success: true,
      message: "Successfully retrieved trip estimate!",
      data: {
        origin: { latitude: 6.6201, longitude: 3.3683 },
        destination: { latitude: 6.5689, longitude: 3.3827 },
        priceDetails: {
          totalPrice: 2134,
          feeForKm: 50,
          feeForTime: 84,
          baseFeePerKm: 5,
          baseFeePerMin: 3,
        },
        time: 28,
        distance: 10,
      },
    };
  }
}
