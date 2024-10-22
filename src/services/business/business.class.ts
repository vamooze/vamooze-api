import { superAdmin } from './../../helpers/permissions';
import { roles } from './../roles/roles';
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from "@feathersjs/feathers";
import { KnexService } from "@feathersjs/knex";
import type { KnexAdapterParams, KnexAdapterOptions } from "@feathersjs/knex";
import {
  getOtp,
  sendEmail,
  successResponseWithPagination,
  successResponse,
} from "../../helpers/functions";
import type { Application } from "../../declarations";
import emailTemplates from "../../helpers/emailTemplates";
import * as crypto from "crypto";
import { Knex } from "knex";
import type {
  Business,
  BusinessData,
  BusinessPatch,
  BusinessQuery,
} from "./business.schema";
import slugify from "slugify";
import { Roles } from "../../interfaces/constants";
export type { Business, BusinessData, BusinessPatch, BusinessQuery };

const {
  NotFound,
  GeneralError,
  BadRequest,
  Forbidden,
  Conflict,
} = require("@feathersjs/errors");


export interface BusinessParams extends KnexAdapterParams<BusinessQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class BusinessService<
  ServiceParams extends Params = BusinessParams,
> extends KnexService<Business, BusinessData, BusinessParams, BusinessPatch> {
  constructor(options: KnexAdapterOptions, app: Application) {
    super(options);
    //@ts-ignore
    this.app = app;
  }

  //@ts-ignore
  async find(params?: ServiceParams) {
    //@ts-ignore
    const knex: Knex = this.app.get("postgresqlClient");
    const query = params?.query || {};
    const { limit = 10, skip = 0 } = query;

    try {
      const userRole = await this.getUserRole(params?.user?.role);
      const isSuperAdmin = userRole.slug === Roles.SuperAdmin;

      const baseConditions = !isSuperAdmin ? { owner: params?.user?.id } : {};

      // Count query without ORDER BY
      const totalQuery = knex("business")
        .where(baseConditions)
        .count("* as count")
        .first();

      // Data query with ORDER BY
      const dataQuery = knex("business")
        .where(baseConditions)
        .orderBy("created_at", "desc")
        .limit(limit)
        .offset(skip);

      // Execute both queries in parallel
      const [totalResult, data] = await Promise.all([totalQuery, dataQuery]);

      // Parse total count safely
      //@ts-ignore
      const totalCount = parseInt(totalResult?.count) || 0;

      // Prepare the result object
      const result = {
        total: totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
        data,
      };

      // Return appropriate response based on user role
      return isSuperAdmin
        ? successResponseWithPagination(
            result,
            200,
            "Business records retrieved successfully"
          )
        : successResponse(data, 200, "Business records retrieved successfully");
    } catch (error) {
      this.handleError(error);
    }
  }

  async toggleStatus(data: any, id: number | string) {
    try {
      if (typeof data !== "object" || data === null) {
        throw new BadRequest("Invalid data: expected an object");
      }

      if (!("active" in data) || typeof data.active !== "boolean") {
        throw new BadRequest(
          'Invalid data: expected an object with "active" key of boolean type'
        );
      }

      const business = await this.get(id);

      if (!business) {
        throw new NotFound("Business not found");
      }

      const updatedBusiness = await this.patch(id, data);

      return successResponse(
        updatedBusiness,
        200,
        //@ts-ignore
        `Business status toggled to ${updatedBusiness?.active ? "active" : "inactive"}`
      );
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      throw new GeneralError(
        "An unexpected error occurred while toggling business status"
      );
    }
  }

  async signup(data: BusinessData) {
    try {
      //@ts-ignore
      const userService = this.app.service("users");
      //@ts-ignore
      const roleService = this.app.service("roles");

      const existingUserByEmail = await userService.find({
        //@ts-ignore
        query: { email: data.email },
      });
      if (existingUserByEmail?.data?.length > 0) {
        throw new BadRequest("User with this email already exists");
      }

      // Check if user with this phone number already exists
      const existingUserByPhone = await userService.find({
        //@ts-ignore
        query: { phone_number: data.phone_number },
      });
      if (existingUserByPhone?.data?.length > 0) {
        throw new BadRequest("User with this phone number already exists");
      }

      // Find the BusinessOwner role
      const role = await roleService.find({
        query: { $limit: 1, slug: Roles.BusinessOwner },
      });
      if (role?.data?.length === 0) {
        throw new BadRequest("Role does not exist");
      }

      // Prepare user data
      const userData = {
        ...data,
        role: role.data[0].id,
        otp: getOtp(),
      };

      // Create the user
      const result = await userService.create(userData);

      // Remove sensitive information from the result
      const { password, pin, ...sanitizedResult } = result;

      return sanitizedResult;
    } catch (error) {
      if (error instanceof BadRequest) {
        throw error;
      }
      throw new Error("An unexpected error occurred during signup");
    }
  }

  //@ts-ignore
  async create(data: any, params?: ServiceParams) {
    //@ts-ignore
    const knex: Knex = this.app.get("postgresqlClient");
    //@ts-ignore
    const userService = this.app.service("users");

    try {
      const userRole = await this.getUserRole(params?.user?.role);
      const slug = this.generateSlug(data.name);

      await this.checkUniqueBusinessName(data.name);

      if (userRole.slug === Roles.SuperAdmin) {
        await this.checkUniqueEmailAndPhone(data.email, data.phone_number, superAdmin);

        return this.createBusinessAsSuperAdmin(
          data,
          params?.user?.id,
          knex,
          userService,
          slug
        );
      } else if (userRole.slug === Roles.BusinessOwner) {
        await this.checkUniqueEmailAndPhone(data.email, data.phone_number, 'business', params?.user?.id);
  
        const  createdBusiness = await this.createBusinessAsBusinessOwner(
          data,
          params?.user?.id,
          knex,
          slug
        );

       return  successResponse(createdBusiness, 200, "Business successfully created"); 
      } else {
        throw new BadRequest("Unauthorized to create a business");
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  //@ts-ignore
  async patch(id: number | string, data: any, params?: ServiceParams) {
    //@ts-ignore
    const knex: Knex = this.app.get("postgresqlClient");

    try {
      const userRole = await this.getUserRole(params?.user?.role);

      let existingBusiness;
      if (userRole.slug == Roles.SuperAdmin) {
         existingBusiness = await knex("business").where({ id }).first();

        if (!existingBusiness) {
          throw new NotFound("Business not found");
        }
      }

      if (userRole.slug !== Roles.SuperAdmin) {
         existingBusiness = await knex("business")
          .where({ owner: params?.user?.id })
          .first();

        if (!existingBusiness) {
          throw new NotFound("Business not found");
        }
      }

      // Remove restricted fields from the update data
      const restrictedFields = [
        "name",
        "slug",
        "phone_number",
        "created_by",
        "owner",
        "email",
      ];
      const sanitizedData = { ...data };

      restrictedFields.forEach((field) => {
        if (field in sanitizedData) {
          delete sanitizedData[field];
        }
      });

      // Only allow superadmin to update active status
      if ("active" in sanitizedData && userRole.slug !== Roles.SuperAdmin) {
        delete sanitizedData.active;
      }

      // If there's nothing left to update after sanitization, throw an error
      if (Object.keys(sanitizedData).length === 0) {
        throw new BadRequest("No valid fields to update");
      }

      // Perform the update
      const [updatedBusiness] = await knex("business")
        .where({ id : existingBusiness?.id })
        .update(sanitizedData)
        .returning("*");

      return successResponse(
        updatedBusiness,
        200,
        "Business updated successfully"
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  private async getUserRole(roleId?: number) {
    //@ts-ignore
    const knex: Knex = this.app.get("postgresqlClient");
    const userRole = await knex("roles")
      .select("slug")
      .where({ id: roleId })
      .first();

    if (!userRole) {
      throw new BadRequest("User role not found");
    }

    return userRole;
  }

  private generateSlug(name: string): string {
    return slugify(name, { lower: true, strict: true });
  }

  private async checkUniqueBusinessName(name: string): Promise<void> {
    //@ts-ignore
    const knex: Knex = this.app.get("postgresqlClient");
    const existingBusiness = await knex("business").where({ name }).first();
    if (existingBusiness) {
      throw new Conflict("Business name already exists");
    }
  }

  private async checkUniqueEmailAndPhone(
    email: string,
    phone: string,
    role: string,
    userId?: number
  ): Promise<void> {
    //@ts-ignore
    const knex: Knex = this.app.get("postgresqlClient");

    if(role  === 'super-admin'){
      const existingUser = await knex("users")
      .where({ email })
      .orWhere({ phone_number: phone })
      .first();
    const existingBusinessContact = await knex("business")
      .where({ email })
      .orWhere({ phone_number: phone })
      .first();

    if (existingUser || existingBusinessContact) {
      throw new Conflict("Email or phone number already in use");
    }
    } else {

      const existingUserWithEmail = await knex("users")
      .where({ email })
      .first();

    if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
      throw new Conflict("Email is already associated with another user");
    }

    // Check if phone exists in users table
    const existingUserWithPhone = await knex("users")
      .where({ phone_number: phone })
      .first();

    if (existingUserWithPhone && existingUserWithPhone.id !== userId) {
      throw new Conflict("Phone number is already associated with another user");
    }

    // Check if email or phone exists in business table
    const existingBusinessContact = await knex("business")
      .where({ email })
      .orWhere({ phone_number: phone })
      .first();

    if (existingBusinessContact) {
      throw new Conflict("Email or phone number already used by another business");
    }

    }

  }

  private async createBusinessAsSuperAdmin(
    data: any,
    superAdminUserId: number | undefined,
    knex: Knex,
    userService: any,
    slug: string
  ) {
    await this.checkUniqueEmailAndPhone(data.email, data.phone_number, superAdmin);

    return knex.transaction(async (trx) => {
      const defaultPassword = crypto.randomBytes(8).toString("hex");
      const BusinessOwnerRole = await knex("roles")
        .where({ slug: Roles.BusinessOwner })
        .select("id")
        .first();

      const newUser = await userService.create(
        {
          first_name: data.name,
          last_name: data.name,
          email: data.email,
          password: defaultPassword,
          phone_number: data.phone,
          role: BusinessOwnerRole.id,
        },
        { transaction: trx }
      );

      const businessData = {
        ...data,
        slug,
        owner: newUser.id,
        created_by: superAdminUserId,
        active: false,
      };

      const [createdBusiness] = await knex("business")
        .insert(businessData)
        .transacting(trx)
        .returning("*");

      await sendEmail({
        toEmail: data.email,
        subject: "Invitation to join as Business owner",
        templateData: emailTemplates.whiteLabelInviteBySuperAdmin(
          data.name,
          data.email,
          defaultPassword
        ),
        receiptName: data.name,
      });

      return successResponse(
        createdBusiness,
        200,
        "Business and user successfully created"
      );
    });
  }

  private async createBusinessAsBusinessOwner(
    data: any,
    userId: undefined | number,
    knex: Knex,
    slug: string
  ) {
    const businessData = {
      ...data,
      slug,
      owner: userId,
      created_by: userId,
      active: false,
    };

    const [createdBusiness] = await knex("business")
      .insert(businessData)
      .returning("*");

   
    return createdBusiness
  }

  private handleError(error: any) {
    if (
      error instanceof BadRequest ||
      error instanceof Conflict ||
      error instanceof NotFound ||
      error instanceof Forbidden
    ) {
      throw error;
    }
    throw new GeneralError(`An unexpected error occurred: ${error?.message}`);
  }
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get("paginate"),
    Model: app.get("postgresqlClient"),
    name: "business",
  };
};
