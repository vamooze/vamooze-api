// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import { KnexService } from "@feathersjs/knex";
import type { KnexAdapterParams, KnexAdapterOptions } from "@feathersjs/knex";
import {
  Roles,
  DispatchApprovalStatus,
  RequestStatus,
  DispatchDecisionDTO,
} from "../../interfaces/constants";
import textConstant from "../../helpers/textConstant";
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
  ServiceParams extends Params = RequestsParams
> extends KnexService<Requests, RequestsData, RequestsParams, RequestsPatch> {
  constructor(options: KnexAdapterOptions, app: Application) {
    super(options);
    //@ts-ignore
    this.app = app;
  }

  //@ts-ignore
  async patch(id: Id, data: any, params: Params) {
    const { user } = params;

    if (data.dispatchDecision) {
      
      // For dispatch drivers accepting or rejecting a request
      await this.validateDispatchUser(user);

      //@ts-ignore
      const { dispatchDecision, requestId, initial_dispatch_location } = data;

      this.validateDispatchDecision(dispatchDecision);

      const request = await this.getAndValidateRequest(id);

      if (dispatchDecision === DispatchDecisionDTO.Reject) {
        return successResponse(null, 200, "Successfully rejected");
      }

      if (request.dispatch) {
        throw new Conflict("This request already has a dispatch assigned");
      }

      //@ts-ignore
      const dispatch = await this.getDispatchData(user?.id);

      // Use transaction for atomic updates
      //@ts-ignore
      const knex = this.app.get("postgresqlClient");
      try {
        const updatedRequest = await knex.transaction(async (trx: any) => {
          // Update the request with the dispatch assignment
          const update = {
            status: RequestStatus.Accepted,
            dispatch: dispatch.id,
          };

          // Update the request with new dispatch details
          const [updatedRequest] = await trx("requests")
            .where({ id })
            .update(update)
            .returning("*"); // Return the updated request

          // Update the dispatch 'onTrip' status
          await trx("dispatch")
            .where({ id: dispatch.id })
            .update({ onTrip: true });

          // Return the updated request inside the transaction
          return updatedRequest;
        });

        delete dispatch.id;

        //@ts-ignore
        this.emit(textConstant.requestAcceptedByDispatch, {
          request: id,
          requester: request?.requester,
          dispatchDetails: dispatch,
          dispatch_who_accepted_user_id: dispatch.user_id,
          message: "Request accepted by dispatch",
        });

        // Return success response
        return successResponse(
          updatedRequest,
          200,
          "Successfully assigned to trip"
        );
      } catch (error) {
        console.error("Error assigning dispatch to request:", error);
        throw new Error("Failed to assign dispatch to request");
      }
    }

    if (data.status) {
      // Check for status update in request data
      await this.validateDispatchUser(user);

      const newStatus = data.status;

      this.validateRequestStatus(newStatus); // Add validation for new status

      const request = await this.getAndValidateRequest(id);

      if (
        [RequestStatus.Delivered, RequestStatus.Expired].includes(
          //@ts-ignore
          request?.status
        )
      ) {
        throw new Conflict("This request cannot be updated.");
      }

      const updatedRequest = await this.updateRequestStatus(
        request.id,
        newStatus
      );

      // Emit event or perform other actions based on new status (optional)

      return successResponse(
        updatedRequest,
        200,
        "Successfully updated request status"
      );
    }

    if (data.current_dispatch_location) {
      // Validate the dispatch user
      await this.validateDispatchUser(user);

      // Ensure the request exists and is valid
      const request = await this.getAndValidateRequest(id);

      // Update the request with the current dispatch location
      //@ts-ignore
      const knex = this.app.get("postgresqlClient");
      const [updatedRequest] = await knex('requests')
        .where({ id })
        .update({ current_dispatch_location: data.current_dispatch_location })
        .returning('*');

      // Optionally, emit an event or take additional actions here

      // Return success response
      return successResponse(
        updatedRequest,
        200,
        'Successfully updated current dispatch location'
      );
    }

  }

  private async validateDispatchUser(user: any) {
    //@ts-ignore
    const userRole = await this.app.service("roles").get(user.role);
    if (userRole.slug !== Roles.Dispatch) {
      throw new BadRequest("Only dispatchers can perform this operation");
    }
  }

  private async validateRequestStatus(status: RequestStatus) {
    if (!Object.values(RequestStatus).includes(status)) {
      throw new BadRequest(`Invalid request status: ${status}`);
    }
  }

  private async updateRequestStatus(id: Id, status: RequestStatus) {
    //@ts-ignore
    const knex = this.app.get("postgresqlClient");

    const [updatedRequest] = await knex("requests")
      .where({ id })
      .update({ status })
      .returning("*");

    return updatedRequest;
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
    return request;
  }

  private async getDispatchData(userId: Id) {
    //@ts-ignore
    const knex = this.app.get("postgresqlClient");

    const dispatchResult = await knex("dispatch")
      .join("users", "dispatch.user_id", "users.id")
      .where("dispatch.user_id", userId)
      .select(
        "users.phone_number",
        "users.first_name",
        "users.last_name",
        "dispatch.address",
        "dispatch.city",
        "dispatch.state",
        "dispatch.lga",
        "dispatch.country",
        "dispatch.available_days",
        "dispatch.available_time_frames",
        "dispatch.id",
        "dispatch.user_id"
      )
      .first();

    if (!dispatchResult) {
      throw new NotFound("Dispatch record does not exist");
    }

    return dispatchResult;
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
  ServiceParams extends Params = RequestsParams
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
