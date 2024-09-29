// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import { KnexService } from "@feathersjs/knex";
import type { KnexAdapterParams, KnexAdapterOptions } from "@feathersjs/knex";
import {
  Roles,
  DispatchApprovalStatus,
  RequestStatus,
  DispatchDecisionDTO,
} from "../../interfaces/constants";
import { addLocationUpdateJob } from "../../queue/request";
import textConstant from "../../helpers/textConstant";
import { Termii } from "../../helpers/termii";
import type { Application } from "../../declarations";
import type {
  Requests,
  RequestsData,
  RequestsPatch,
  RequestsQuery,
} from "./requests.schema";
import {
  successResponse,
  checkDistanceAndTimeUsingLongLat,
} from "../../helpers/functions";
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
    const termii = new Termii();
    //@ts-ignore
    const knex = this.app.get("postgresqlClient");
    const { user } = params;

    if (data.dispatchDecision) {
      // For dispatch drivers accepting or rejecting a request
      await this.validateDispatchUser(user);

      //@ts-ignore
      const { dispatchDecision, requestId, initial_dispatch_location } = data;

      this.validateDispatchDecision(dispatchDecision);

      this.validateLongLat(initial_dispatch_location);

      const request = await this.getAndValidateRequest(id);

      if (dispatchDecision === DispatchDecisionDTO.Reject) {
        return successResponse(null, 200, "Successfully rejected");
      }

      if (request.dispatch) {
        throw new Conflict("This request already has a dispatch assigned");
      }

      //@ts-ignore
      const dispatch = await this.getDispatchData(user?.id);

      const update = {
        status: RequestStatus.Accepted,
        dispatch: dispatch.id,
        initial_dispatch_location,
        dispatch_accept_time: new Date().toISOString(),
      };

      const pickupEstimate = await checkDistanceAndTimeUsingLongLat(
        initial_dispatch_location,
        request.pickup_gps_location
      );
      const deliveryEstimate = await checkDistanceAndTimeUsingLongLat(
        request.pickup_gps_location,
        request.delivery_gps_location
      );

      if (pickupEstimate && pickupEstimate.status === "OK") {
        //@ts-ignore
        update.estimated_time_for_dispatch_pickup = Math.ceil(
          pickupEstimate.routes[0].legs[0].duration.value / 60
        );
      }

      if (deliveryEstimate && deliveryEstimate.status === "OK") {
        //@ts-ignore
        update.estimated_time_for_dispatch_delivery = Math.ceil(
          deliveryEstimate.routes[0].legs[0].duration.value / 60
        );
      }

      // Use transaction for atomic updates

      try {
        const updatedRequest = await knex.transaction(async (trx: any) => {
          // Update the request with the dispatch assignment

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

        const requesterUserDetail = await knex("users")
          .select()
          .where({ id: request?.requester })
          .first();

        if (requesterUserDetail) {
          await termii.sendSMS(
            requesterUserDetail.phone_number,
            `You delivery request has been accepted by ${dispatch.first_name} ${dispatch.last_name}`
          );
        }

        // register a job to have the mobile frequently update the redis cache with current location
        await addLocationUpdateJob({
          dispatch_who_accepted_user_id: dispatch.user_id,
          frequency: 300000,
          request: Number(id),
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

      this.validateRequestStatus(data.status); // Add validation for new status

      const request = await this.getAndValidateRequest(id);

      if (request?.status === RequestStatus.CompleteDropOff) {
        throw new Conflict(
          "This request cannot be updated, trip has been completed"
        );
      }

      //complete_pick_up and complete_drop_off    "dispatch_pickup_time",

      if(data.status === RequestStatus.CompletePickUp ){
        data.dispatch_to_drop_off_time =  new Date().toISOString()
      }

      if(data.status === RequestStatus.CompleteDropOff ){
        data.dispatch_drop_off_time  =  new Date().toISOString()
      }

      const updatedRequest = await this.updateRequestStatus(
        request.id,
        data
      );

      // Emit event or perform other actions based on new status (optional)
      //@ts-ignore
      this.emit(textConstant.deliveryUpdate, {
        request: updatedRequest.id,
        requester: updatedRequest?.requester,
        data: updatedRequest,
        message: "Delivery Update",
      });

      if (
        newStatus === RequestStatus.CompleteDropOff ||
        newStatus === RequestStatus.CompletePickUp
      ) {
        const requesterUserDetail = await knex("users")
          .select()
          .where({ id: updatedRequest?.requester })
          .first();

        let message = ''
        if(newStatus === RequestStatus.CompleteDropOff){
          message = 'Your delivery has been completed'
        }

        if(newStatus === RequestStatus.CompletePickUp){
          message = 'Your delivery item has been picked an enroute for delivery'
        }

        if (requesterUserDetail) {
          await termii.sendSMS(
            requesterUserDetail.phone_number,
            message
          );
        }
      }

      return successResponse(
        updatedRequest,
        200,
        "Successfully updated request status"
      );
    }

    if (data.current_dispatch_location) {
      // Validate the dispatch user
      // await this.validateDispatchUser(user);

      // Ensure the request exists and is valid
      // const request = await this.getAndValidateRequest(id);

      // Update the request with the current dispatch location
      //@ts-ignore
      const knex = this.app.get("postgresqlClient");
      const [updatedRequest] = await knex("requests")
        .where({ id })
        .update({ current_dispatch_location: data.current_dispatch_location })
        .returning("*");

      // Optionally, emit an event or take additional actions here
      //@ts-ignore
      this.emit(textConstant.locationUpdateRequester, {
        message: "Request details updated",
        data: updatedRequest,
      });

      // Return success response
      return successResponse(
        updatedRequest,
        200,
        "Successfully updated current dispatch location"
      );
    }

    if (data.cancel_request_requester) {
      const request = await this.getAndValidateRequest(id);

      if (
        request.status === RequestStatus.Delivered ||
        request.status === RequestStatus.Expired
      ) {
        throw new Conflict("This request cannot be cancelled.");
      }

      //@ts-ignore
      // const dispatch = await this.getDispatchDataFromRequest(user?.id);

      // Use transaction for atomic updates
      //@ts-ignore
      const knex = this.app.get("postgresqlClient");
      try {
        const queryData = await knex.transaction(async (trx: any) => {
          // Update the request status to Cancelled
          const [updatedRequest] = await trx("requests")
            .where({ id })
            .update({
              status: RequestStatus.Cancelled,
              //@ts-ignore
              cancelled_by: user.id,
              cancellation_reason: data.cancellation_reason,
              cancelled_at: knex.fn.now(),
            })
            .returning("*");

          // If a dispatch was assigned, update their 'onTrip' status
          if (updatedRequest.dispatch) {
            const [updatedDispatch] = await trx("dispatch")
              .where({ id: updatedRequest.dispatch })
              .update({ onTrip: false })
              .returning("*");

            return { updatedRequest, updatedDispatch };
          }
          return { updatedRequest };
        });

        if (queryData.updatedDispatch) {
          // Remove the location update job if it exists
          // await removeLocationUpdateJob
          //   dispatch_who_accepted_user_id: updatedRequest.dispatch,
          //   request: Number(id),
          // });

          // Emit cancellation event
          //@ts-ignore
          this.emit(textConstant.requestCancelledByRequester, {
            request: id,
            //@ts-ignore
            requester: user.id,
            //@ts-ignore
            dispatch_who_accepted_user_id: queryData.updatedDispatch.user_id,
            message: "Request cancelled by requester",
          });
        }

        return successResponse(
          queryData.updatedRequest,
          200,
          "Successfully cancelled the request"
        );
      } catch (error) {
        console.error("Error cancelling request:", error);
        throw new Error("Failed to cancel the request");
      }
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

  private validateLongLat(location: any) {
    if (
      typeof location !== "object" ||
      typeof location.latitude !== "number" ||
      typeof location.longitude !== "number"
    ) {
      throw new BadRequest(
        "Initial dispatch location must be an object with latitude and longitude as numbers."
      );
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
