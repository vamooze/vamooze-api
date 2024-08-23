import type { Params } from "@feathersjs/feathers";
import { KnexService } from "@feathersjs/knex";
import type { KnexAdapterParams, KnexAdapterOptions } from "@feathersjs/knex";
import { NotFound, Forbidden, BadRequest } from "@feathersjs/errors";
import { ApprovalStatus } from "./dispatch.schema";
import type { Application } from "../../declarations";
import type {
  Dispatch,
  DispatchData,
  DispatchPatch,
  DispatchQuery,
} from "./dispatch.schema";
import { Roles, DispatchApprovalStatus } from "../../interfaces/constants";
import { customErrorResponse, successResponse } from "../../helpers/functions";

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
    //@ts-ignore
    const userRole = await this.app.service("roles").get(user.role);

    //@ts-ignore
    const one_signal_player_id = data?.one_signal_player_id;
    
    if (one_signal_player_id && typeof one_signal_player_id !== "string") {
      return customErrorResponse(400, `One signal id  must be string`);
    }

    // Determine the dispatch record to update
    let dispatchId: string;
    if (userRole.slug === Roles.SuperAdmin) {
      if (!id) {
        return customErrorResponse(400, "No dispatch ID provided");
      }
      dispatchId = id;
    } else {
      //@ts-ignore
      if (id && id !== user.id) {
        throw new Forbidden("You can only update your own dispatch record");
      }
      //@ts-ignore
      dispatchId = user.id;
    }

    // Fetch the existing dispatch record
    let dispatch: Dispatch;
    try {
      dispatch = await super.get(dispatchId);
    } catch (error) {
      return customErrorResponse(
        404,
        `No dispatch found with ID ${dispatchId}`
      );
    }

    // Prepare the update object
    const update: Partial<Dispatch> = {};

    // Handle admin-only updates, admin can only update approval status and suspension
    if (userRole.slug === Roles.SuperAdmin) {
      if (data.suspended !== undefined) {
        update.suspended = data.suspended;
        //@ts-ignore
        update.suspended_at = data.suspended ? new Date().toISOString() : null;
        //@ts-ignore
        update.suspended_by = data.suspended ? user.id : null;
      }

      if (data.approval_status !== undefined) {
        if (!Object.values(ApprovalStatus).includes(data.approval_status)) {
          return customErrorResponse(400, `Invalid approval status`);
        }
        update.approval_status = data.approval_status;
        //@ts-ignore
        update.approved_by = user.id;
        update.approval_date = new Date().toISOString();
      }
    } else {
      // dispatch user only updates occur here

      if (data.suspended || data.approval_status) {
        return customErrorResponse(403, `Unauthorized operation for dispatch`);
      }

    
      if (data.isAcceptingPickUps !== undefined) {
        if (typeof data.isAcceptingPickUps !== "boolean") {
          return customErrorResponse(400, `isAcceptingPickUps must be boolean`);
        }
        update.isAcceptingPickUps = data.isAcceptingPickUps;
      }
    }

    if (Object.keys(update).length === 0) {
      //@ts-ignore
      if (!one_signal_player_id) {
        return customErrorResponse(400, "No valid fields to update");
      }

      //@ts-ignore
      await this.app
        .service("users")
        //@ts-ignore
        .patch(user.id, { one_signal_player_id });

      return successResponse(null, 200, "One signal ID saved successfully");
    } else {
      const updatedDispatch = await super.patch(dispatchId, update, params);

      //@ts-ignore
      return successResponse(
        updatedDispatch,
        200,
        "Dispatch updated successfully"
      );
    }
  }
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get("paginate"),
    Model: app.get("postgresqlClient"),
    name: "dispatch",
  };
};
