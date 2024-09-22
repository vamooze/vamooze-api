// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from "@feathersjs/feathers";
import { KnexService } from "@feathersjs/knex";
import type { KnexAdapterParams, KnexAdapterOptions } from "@feathersjs/knex";

import type { Application } from "../../declarations";
import type { User, UserData, UserPatch, UserQuery } from "./users.schema";
import {
  GeneralError,
  NotFound,
  Conflict,
  NotAuthenticated,
  BadRequest,
} from "@feathersjs/errors";
import {
  getOtp,
  isVerified,
  sendEmail,
  successResponse,
  successResponseWithPagination,
} from "../../helpers/functions";

export type { User, UserData, UserPatch, UserQuery };

export interface UserParams extends KnexAdapterParams<UserQuery> {}
const SELECTED_FIELDS = [
  "id",
  "first_name",
  "last_name",
  "email",
  "phone_number",
  "is_verified",
  "is_suspended",
];

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class UserService<
  ServiceParams extends Params = UserParams,
> extends KnexService<User, UserData, UserParams, UserPatch> {
  constructor(options: KnexAdapterOptions, app: Application) {
    super(options);
    //@ts-ignore
    this.app = app;
  }

  //@ts-ignore
  async findUnverified(params) {
    const { query = {} } = params;
    //@ts-ignore
    const knex = this.app.get("postgresqlClient");

    // Set default values for pagination
    const $limit =
      typeof query.$limit !== "undefined"
        ? parseInt(query.$limit as string)
        : 10;
    const $skip =
      typeof query.$skip !== "undefined" ? parseInt(query.$skip as string) : 0;

    // Set default sort order
    const $sort = query.$sort || { id: 1 };

    // Build the base query
    let baseQuery = knex<User>("users").where({ is_verified: false });

    // Count query
    const countQuery = baseQuery.clone().count("* as count").first();

    // Data query
    let dataQuery = baseQuery.clone().select(SELECTED_FIELDS);

    // Apply sorting
    Object.entries($sort).forEach(([field, direction]) => {
      dataQuery = dataQuery.orderBy(field, direction === 1 ? "asc" : "desc");
    });

    // Apply pagination
    dataQuery = dataQuery.limit($limit).offset($skip);

    // Execute both queries concurrently
    const [total, data] = await Promise.all([countQuery, dataQuery]);

    const unverifiedUsers = {
      total: parseInt((total as any).count),
      limit: $limit,
      skip: $skip,
      data,
    };

    return successResponseWithPagination(
      unverifiedUsers,
      200,
      "Unverified users"
    );
  }

  async suspendUser(params: any) {
    const user_to_be_suspended_Id = params.route.id;
    const admin_user_suspending_Id = params.user.id;
    //@ts-ignore
    const knex = this.app.get("postgresqlClient");

    const user = await knex("users")
      .select(SELECTED_FIELDS)
      .where({ id: user_to_be_suspended_Id })
      .first();

    if (!user) {
      throw new NotFound("User not found");
    }

    if (user.is_suspended) {
      throw new Conflict("User is already suspended");
    }

    const [updatedUser] = await knex("users")
      .where({ id: user_to_be_suspended_Id })
      .update({ is_suspended: true })
      .returning(SELECTED_FIELDS);

    return successResponse(updatedUser, 200, "User suspended successfully");
  }
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get("paginate"),
    Model: app.get("postgresqlClient"),
    name: "users",
  };
};
