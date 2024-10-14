// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import { KnexService } from "@feathersjs/knex";
import type { KnexAdapterParams, KnexAdapterOptions } from "@feathersjs/knex";
import {
  Roles,
  RequestPaymentMethod,
  RequestStatus,
  DispatchDecisionDTO,
  TransactionType,
  TransactionStatus,
} from "../../interfaces/constants";
import { addLocationUpdateJob, locationUpdateQueue } from "../../queue/request";
import textConstant from "../../helpers/textConstant";
import { Termii } from "../../helpers/termii";
import type { Application } from "../../declarations";
import { logger } from "../../logger";
import type {
  Requests,
  RequestsData,
  RequestsPatch,
  RequestsQuery,
} from "./requests.schema";
import {
  successResponse,
  checkDistanceAndTimeUsingLongLat,
  successResponseWithPagination,
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
  async find(params: ServiceParams) {
    //@ts-ignore
    const knex = this.app.get("postgresqlClient");

    const limit = params?.query?.$limit ?? 10;
    const skip = params?.query?.$skip ?? 0;
    const requester = params?.user?.id ?? 0;

    const requests = await knex("requests")
      .leftJoin("dispatch", "requests.dispatch", "dispatch.id")
      .leftJoin("users", "dispatch.user_id", "users.id")
      .select(
        "requests.*",
        "users.first_name AS dispatch_first_name",
        "users.last_name AS dispatch_last_name",
        "users.phone_number AS dispatch_phone_number"
      )
      .where("requests.requester", requester)
      .orderBy("requests.created_at", "DESC") // Sort by creation date
      .limit(limit) // Handle pagination
      .offset(skip);

    const total = await knex("requests")
      .where("requester", requester)
      .count("* as count")
      .first();

    const result = { total: total.count, limit, skip, data: requests };

    return successResponseWithPagination(
      result,
      200,
      "Requests retrieved successfully"
    );
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
      const { dispatchDecision, initial_dispatch_location } = data;

      logger.info(`processing dispatch acceptance....`);

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

        // register a job to have the mobile frequently update the redis cache with current location
        await addLocationUpdateJob({
          dispatch_who_accepted_user_id: dispatch.user_id,
          request: Number(id),
        });

        logger.info(`emitting event to requester and other dispatch riders`);

        delete dispatch.id;

        //@ts-ignore
        this.emit(textConstant.requestAcceptedByDispatch, {
          request: id,
          requester: request?.requester,
          dispatchDetails: dispatch,
          dispatch_who_accepted_user_id: dispatch.user_id,
          dispatch_pool: request.dispatch_pool,
          message: "Request accepted by dispatch",
        });

        logger.info(`done returning a response: 10`);

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

      if (data.status === RequestStatus.CompletePickUp) {
        data.dispatch_to_drop_off_time = new Date().toISOString();
      }

      delete data.requestId; // have efe remove requestId from handler

      if (data.status === RequestStatus.Delivered) {
        try {
          await knex.transaction(async (trx: any) => {
            const [completedRequest] = await knex("requests")
              .where({ id })
              .update({
                status: RequestStatus.Delivered,
                dispatch_to_drop_off_time: new Date().toISOString(),
              })
              .returning("*");

               await trx("dispatch")
        .where({ id: completedRequest.dispatch })
        .update({ onTrip: false });

            const requesterUserDetail = await knex("users")
              .select()
              .where({ id: completedRequest?.requester })
              .first();

           let message = "Your delivery has been completed"
            if (
              completedRequest.payment_method === RequestPaymentMethod.wallet
            ) {

              message = `Your delivery has been completed and ${completedRequest.delivery_price_details.totalPrice} has been deducted from your wallet`
              const debitedWallet = await knex("wallet")
                .where({
                  user_id: completedRequest?.requester,
                })
                .decrement(
                  "balance",
                  completedRequest.delivery_price_details.totalPrice
                );

              //@ts-ignore
              const transactionService = this.app.service("transactions");
              const transactionData = {
                wallet_id: debitedWallet.id,
                type: TransactionType.Withdrawal,
                amount: completedRequest.delivery_price_details.totalPrice,
                status: TransactionStatus.Completed,
                reference: "vazoome",
                metadata: {
                  initiatedBy: "vazoome",
                  paymentMethod: "wallet",
                },
              };

              //@ts-ignore
              await transactionService.create(transactionData);
            }

            //@ts-ignore
            this.emit(textConstant.deliveryUpdate, {
              request: completedRequest.id,
              requester: completedRequest?.requester,
              data: completedRequest,
              message,
            });

            if (requesterUserDetail) {
              await termii.sendSMS(
                requesterUserDetail.phone_number,
                message
              );
            }
          });

          logger.info(`Trip completed`);
        } catch (error) {
          logger.error(
            `Failed to updated trip details  when completed:`,
            error
          );
        }
      } else {
        const updatedRequest = await this.updateRequestStatus(request.id, data);

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

          let message = "";

          if (newStatus === RequestStatus.EnrouteToPickUp) {
            message = "Dispatch on way to pickup";
          }

          if (newStatus === RequestStatus.CompletePickUp) {
            message =
              "Your delivery item has been picked an enroute for delivery";
          }

          if (requesterUserDetail) {
            await termii.sendSMS(requesterUserDetail.phone_number, message);
          }
        }

        return successResponse(
          updatedRequest,
          200,
          "Successfully updated request status"
        );
      }
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

  async getByTrackingId(trackingId: string) {
    //@ts-ignore
    const knex = this.app.get("postgresqlClient");

    const request = await knex("requests")
      .leftJoin("dispatch", "requests.dispatch", "dispatch.id")
      .leftJoin(
        "users AS dispatch_user",
        "dispatch.user_id",
        "dispatch_user.id"
      )
      .leftJoin(
        "users AS requester_user",
        "requests.requester",
        "requester_user.id"
      )
      .select(
        "requests.*",
        "dispatch_user.first_name AS dispatch_first_name",
        "dispatch_user.last_name AS dispatch_last_name",
        "dispatch_user.phone_number AS dispatch_phone_number",
        "requester_user.first_name AS requester_first_name",
        "requester_user.last_name AS requester_last_name",
        "requester_user.phone_number AS requester_phone_number"
      )
      .where("requests.tracking_id", trackingId)
      .first();

    if (!request) {
      throw new NotFound(`No request found with tracking ID: ${trackingId}`);
    }

    return successResponse(request, 200, "Request data retrieved successfully");
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
      .update(status)
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
