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
    events: ['new-delivery-request'],
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
  async create(data) {
    return {
      status: 200,
      success: true,
      message: "Successfully retrieved trip estimate!",
      data
    };
  }
}
