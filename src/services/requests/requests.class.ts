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

    if (params?.query?.dispatchDecision) {
      await this.validateDispatchUser(user);

      //@ts-ignore
      const { dispatchDecision } = params?.query;
      //@ts-ignore
      delete params?.query.dispatchDecision;

      this.validateDispatchDecision(dispatchDecision);

      await this.getAndValidateRequest(id);

      if (dispatchDecision === DispatchDecisionDTO.Reject) {
        return successResponse(null, 200, "Successfully rejected");
      }

      //@ts-ignore
      const dispatchId = await this.getDispatchId(user?.id);

      const update = {
        status: RequestStatus.Accepted,
        dispatch: dispatchId,
      };

      const updatedRequest = await super.patch(id, update, params);

      // Uncomment and adjust if you want to update dispatch status
      // await this.updateDispatchStatus(user.id, true);

      return successResponse(
        updatedRequest,
        200,
        "Successfully assigned to trip"
      );
    }
  }

  private async validateDispatchUser(user: any) {
    //@ts-ignore
    const userRole = await this.app.service("roles").get(user.role);
    if (userRole.slug !== Roles.Dispatch) {
      throw new BadRequest("Only dispatchers can accept or reject requests");
    }
  }

  private validateDispatchDecision(decision: DispatchDecisionDTO) {
    if (!Object.values(DispatchDecisionDTO).includes(decision)) {
      throw new BadRequest(`Invalid dispatch decision: ${decision}`);
    }
  }

  private async getAndValidateRequest(id: Id) {
    const request = await super.get(id);
    if (!request) {
      throw new NotFound("Request not found");
    }
    if (request.dispatch) {
      throw new Conflict("This request already has a dispatch assigned");
    }
    return request;
  }

  private async getDispatchId(userId: Id) {
    //@ts-ignore
    const dispatchResult = await this.app.service("dispatch").find({
      query: { user_id: userId },
    });

    if (dispatchResult.data.length !== 1) {
      throw new NotFound("Dispatch record does not exist");
    }

    return dispatchResult.data[0].id;
  }

  private async updateDispatchStatus(userId: Id, onTrip: boolean) {
    //@ts-ignore
    await this.app
      .service("dispatch")
      .patch(null, { onTrip }, { query: { user_id: userId } });
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
