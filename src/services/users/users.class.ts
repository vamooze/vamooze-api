// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from "@feathersjs/feathers";
import { KnexService } from "@feathersjs/knex";
import type { KnexAdapterParams, KnexAdapterOptions } from "@feathersjs/knex";
import emailTemplates from "../../helpers/emailTemplates";
import * as crypto from "crypto";
import type { Application } from "../../declarations";
import { Roles } from "../../interfaces/constants";
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
import { inhouseInviteValidator } from "../index";

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
    const $limit = query.limit
      typeof query.limit !== "undefined"
        ? parseInt(query.limit as string)
        : 10;
    const $skip =
      typeof query.$skip !== "undefined" ? parseInt(query.skip as string) : 0;

    // Set default sort order
    const $sort = query.sort || { id: 1 };

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
      limit: parseInt($limit),
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

  async inviteUser(data: any, params: any) {
    try {
      const { email, first_name, last_name, phone_number } = data;
      const { role: queryRole } = params.query;
      const buisness_user_inviting_Id = params.user.id;

      if (!queryRole) {
        throw new BadRequest("Role parameter is required");
      }

      try {
        await inhouseInviteValidator.validateAsync(data);
      } catch (validationError) {
        //@ts-ignore
        throw new BadRequest(validationError.details[0].message);
      }

      //@ts-ignore
      const usersService = this.app.service("users");
      //@ts-ignore
      const knex = this.app.get("postgresqlClient");

      const user = await knex("users")
        .select(SELECTED_FIELDS)
        .where({ email })
        .first();

      // Check if user already exists
      if (user) {
        throw new Conflict("User with this email already exists");
      }

      const role = await knex("roles")
        .select("id")
        .where({ slug: Roles.InHouseManager })
        .first();

      if (!role) {
        throw new BadRequest("In-House Manager role not found");
      }

      // Generate a default password
      const defaultPassword = crypto.randomBytes(8).toString("hex");

      // Create the user
      await usersService.create({
        first_name,
        last_name,
        email,
        password: defaultPassword,
        role: role.data[0].id,
        is_verified: true,
        phone_number,
        is_inhouse_invitee_default_password: true,
        in_house_inviter: buisness_user_inviting_Id,
      });

      // Send invitation email
      await sendEmail({
        toEmail: email,
        subject: `Invitation to join as In-House Manager`,
        templateData: emailTemplates.inHouseManagerInvite(
          first_name,
          email,
          defaultPassword
        ),
        receiptName: `${first_name} ${last_name}`,
      });

      return successResponse(null, 201, "Invitation sent successfully");
    } catch (error) {
      if (error instanceof BadRequest || error instanceof Conflict) {
        throw error; // Re-throw these specific errors as they are already handled
      }

      throw new GeneralError(
        "An unexpected error occurred while processing your request"
      );
    }
  }
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get("paginate"),
    Model: app.get("postgresqlClient"),
    name: "users",
  };
};
