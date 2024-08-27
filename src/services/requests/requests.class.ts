// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import { KnexService } from "@feathersjs/knex";
import type { KnexAdapterParams, KnexAdapterOptions } from "@feathersjs/knex";
import {
  Roles,
  DispatchApprovalStatus,
  RequestStatus,
  DispatchDecisionDTO,
} from "../../interfaces/constants";
import type { Application } from "../../declarations";
import type {
  Requests,
  RequestsData,
  RequestsPatch,
  RequestsQuery,
} from "./requests.schema";
import { successResponse } from "../../helpers/functions";
import type { Params, Id, NullableId } from "@feathersjs/feathers";
import { NotFound, Forbidden, BadRequest, Conflict } from "@feathersjs/errors";

export type { Requests, RequestsData, RequestsPatch, RequestsQuery };

export interface RequestsParams extends KnexAdapterParams<RequestsQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class RequestsService<
  ServiceParams extends Params = RequestsParams,
> extends KnexService<Requests, RequestsData, RequestsParams, RequestsPatch> {
  constructor(options: KnexAdapterOptions, app: Application) {
    super(options);
    //@ts-ignore
    this.app = app;
  }

  //@ts-ignore
  async patch(id: Id, data: any, params: Params) {
    const { user } = params;

    //@ts-ignore
    const userRole = await this.app.service("roles").get(user.role);
     //@ts-ignore
    const dispatchUserDetails = await this.app.service("dispatch").find({
      query: {
        //@ts-ignore
        user_id: user.id,
      },
    });

    if (dispatchUserDetails.data.length !== 1) {
      throw new NotFound("Dispatch record does not exist");
    }

    if (userRole.slug === Roles.Dispatch) {
      const update: Partial<Requests> = {};

      if (params?.query?.dispatchDecision) {
        const { dispatchDecision } = params?.query;

        delete params?.query.dispatchDecision

        if (!Object.values(DispatchDecisionDTO).includes(dispatchDecision))
          throw new BadRequest(
            `Invalid dispatch decision: ${dispatchDecision}`
          );

        const request = await super.get(id);

        if (!request) {
          throw new NotFound("Request not found");
        }

        if (request.dispatch) {
          throw new Conflict("This request already has a dispatch assigned");
        }

        if (dispatchDecision === DispatchDecisionDTO.Reject)
          return successResponse(null, 200, "Successfully rejected");

        update.status = RequestStatus.Accepted;
         //@ts-ignore
        update.dispatch = dispatchUserDetails.data[0].id;
   
        //@ts-ignore
        // await this.app
        //   .service("dispatch")
        //   .patch(
        //     {
        //       query: {
        //         //@ts-ignore
        //         user_id: user.id,
        //       },
        //     },
        //     { onTrip: true }
        //   );

 

        const updatedRequest = await super.patch(id, update, params);

        return successResponse(
          updatedRequest,
          200,
          "Successfully assigned to trip"
        );
      }



    }
  }
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get("paginate"),
    Model: app.get("postgresqlClient"),
    name: "requests",
    events: ["new-delivery-request"],
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
      data,
    };
  }
}
