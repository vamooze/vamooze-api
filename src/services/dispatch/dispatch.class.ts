import type { Params } from "@feathersjs/feathers";
import { KnexService } from "@feathersjs/knex";
import type { KnexAdapterParams, KnexAdapterOptions } from "@feathersjs/knex";
import { NotFound, Forbidden, BadRequest } from "@feathersjs/errors";
import type { Application } from "../../declarations";
import type {
  Dispatch,
  DispatchData,
  DispatchPatch,
  DispatchQuery,
} from "./dispatch.schema";
import { Roles, DispatchApprovalStatus } from "../../interfaces/constants";
import {
  successResponse,
  successResponseWithPagination,
  sendPush,
} from "../../helpers/functions";
import textConstant from "../../helpers/textConstant";
import { boolean } from "joi";

export type { Dispatch, DispatchData, DispatchPatch, DispatchQuery };

export interface DispatchParams extends KnexAdapterParams<DispatchQuery> {}

export class DispatchService<
  ServiceParams extends Params = DispatchParams,
> extends KnexService<Dispatch, DispatchData, DispatchParams, DispatchPatch> {
  constructor(options: KnexAdapterOptions, app: Application) {
    super(options);
    //@ts-ignore
    this.app = app;
  }

  //@ts-ignore
  async patch(id: string, data: DispatchPatch, params: DispatchParams) {
    const { user } = params;

    if (!user) return;

    //@ts-ignore
    const knex = this.app.get("postgresqlClient");

    //@ts-ignore
    const userRole = await this.app.service("roles").get(user?.role);

    //@ts-ignore
    const { one_signal_player_id, one_signal_alias } = data;

    const dispatchDetails = await knex("dispatch")
      .select()
      .where({ user_id: id })
      .first();

    const dispatchUserDetail = await knex("users")
      .select()
      .where({ id })
      .first();

    if (!dispatchDetails) {
      throw new NotFound("Dispatch not found with user id provided");
    }

    if (!dispatchUserDetail) {
      throw new NotFound("User not found with id provided");
    }

    const dispatchId = dispatchDetails.id;
    const update: Partial<Dispatch> = {};

    if (userRole.slug === Roles.SuperAdmin) {
      this.handleAdminUpdates(data, update, user, dispatchUserDetail);
    } else {
      this.handleDispatchUserUpdates(data, update);
    }

    if (Object.keys(update).length === 0) {
      if (!one_signal_player_id && !one_signal_alias) {
        throw new BadRequest("No valid fields to update");
      }

      return this.handleOneSignalUpdate(
        id,
        one_signal_player_id,
        one_signal_alias
      );
    }

    const updatedDispatch = await this.updateDispatchAndUser(
      knex,
      dispatchId,
      id,
      update
    );
    return successResponse(
      updatedDispatch,
      200,
      "Dispatch updated successfully"
    );
  }

  private handleAdminUpdates(
    data: DispatchPatch,
    update: Partial<Dispatch>,
    adminUser: any,
    dispatchUserDetail: any
  ) {
    if (data.suspended !== undefined) {
      this.ensureBoolean(data.suspended, "suspended");
      update.suspended = data.suspended;
      //@ts-ignore
      update.suspended_at = new Date().toISOString();
      update.suspended_by = adminUser.id;
    }

    if (data.approval_status !== undefined) {
      this.validateApprovalStatus(data.approval_status);
      update.approval_status = data.approval_status;
      update.approved_by = adminUser.id;
      update.approval_date = new Date().toISOString();

      if (
        data.approval_status === DispatchApprovalStatus.Approved &&
        dispatchUserDetail.one_signal_alias
      ) {
        this.sendApprovalPushNotification(dispatchUserDetail);
      }
    }
  }

  private handleDispatchUserUpdates(
    data: DispatchPatch,
    update: Partial<Dispatch>
  ) {
    if (data.suspended || data.approval_status) {
      throw new Forbidden("Unauthorized operation for dispatch");
    }

    if (data.isAcceptingPickUps !== undefined) {
      this.ensureBoolean(data.isAcceptingPickUps, "isAcceptingPickUps");
      if (typeof data.isAcceptingPickUps !== "boolean") {
        throw new BadRequest("isAcceptingPickUps must be boolean");
      }
      update.isAcceptingPickUps = data.isAcceptingPickUps;
    }
  }

  private async handleOneSignalUpdate(
    userId: string,
    playerId?: string,
    alias?: string
  ) {
    if (playerId && typeof playerId !== "string") {
      throw new BadRequest("One signal id must be string");
    }

    //@ts-ignore
    await this.app.service("users").patch(userId, {
      one_signal_player_id: playerId,
      one_signal_alias: alias,
    });
    return successResponse(null, 200, "One signal ID saved successfully");
  }

  private async updateDispatchAndUser(
    knex: any,
    dispatchId: string,
    userId: string,
    update: Partial<Dispatch>
  ) {
    return knex.transaction(async (trx: any) => {
      const [updatedDispatch] = await trx("dispatch")
        .where("id", dispatchId)
        .update(update)
        .returning("*");

      if (update.approval_status === DispatchApprovalStatus.Approved) {
        await trx("users").where("id", userId).update({ is_verified: true });
      }

      return updatedDispatch;
    });
  }

  private validateApprovalStatus(status: DispatchApprovalStatus) {
    if (!Object.values(DispatchApprovalStatus).includes(status)) {
      throw new BadRequest("Invalid approval status");
    }
  }

  private ensureBoolean(value: boolean, field: string) {
    if (typeof value !== "boolean") {
      throw new BadRequest(`${field} must be a boolean`);
    }
  }

  private async sendApprovalPushNotification(dispatchUserDetail: any) {
    sendPush(
      textConstant.dispatchApproval,
      textConstant.pushNotifications.english.dispatchApprovalMessage,
      [dispatchUserDetail.one_signal_alias],
      { status: DispatchApprovalStatus.Approved }
    );
  }

  async findAssignedRequests(params: Params) {
    //@ts-ignore
    const knex = this.app.get("postgresqlClient");
    const { user, query } = params;

    const dispatchRecord = await knex("dispatch")
      .where({ user_id: user?.id })
      .select("id")
      .first();

    if (!dispatchRecord) {
      throw new NotFound("Dispatch record not found for this user.");
    }

    const limit = query?.limit || 10;
    const skip = query?.skip || 0;

    const assignedRequestsQuery = knex("requests")
      .where({ dispatch: dispatchRecord.id })
      .limit(limit)
      .offset(skip);

    const [total, data] = await Promise.all([
      assignedRequestsQuery.clone().count("* as total").first(),
      assignedRequestsQuery.select("*"),
    ]);

    const responseData = {
      //@ts-ignore
      total: total.total,
      limit,
      skip,
      data,
    };

    return successResponseWithPagination(
      //@ts-ignore
      responseData,
      200,
      "All dispatch requests received"
    );
  }
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get("paginate"),
    Model: app.get("postgresqlClient"),
    name: "dispatch",
  };
};
