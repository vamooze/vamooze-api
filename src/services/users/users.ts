// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from "@feathersjs/authentication";
import { NotFound, BadRequest, Conflict, GeneralError } from "@feathersjs/errors";
import { hooks as schemaHooks } from "@feathersjs/schema";
import * as crypto from "crypto";
import {
  userDataValidator,
  userPatchValidator,
  userQueryValidator,
  userResolver,
  userExternalResolver,
  userDataResolver,
  userPatchResolver,
  userQueryResolver,
} from "./users.schema";
import { inhouseInviteValidator } from "../index";
import { Request, Response } from "express";

import { Application, HookContext } from "../../declarations";
import { UserService, getOptions } from "./users.class";
import { userPath, userMethods } from "./users.shared";
import { checkPermission } from "../../helpers/checkPermission";
import emailTemplates from "../../helpers/emailTemplates";
import {
  getOtp,
  isVerified,
  sendEmail,
  successResponse,
} from "../../helpers/functions";
import { Roles, TemplateName, TemplateType } from "../../interfaces/constants";

const { protect, hashPassword } =
  require("@feathersjs/authentication-local").hooks;

export * from "./users.class";
export * from "./users.schema";

// A configure function that registers the service and its hooks via `app.configure`
export const user = (app: Application) => {
  // Register our service on the Feathers application
  app.use(userPath, new UserService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: userMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.service(userPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(userExternalResolver),
        schemaHooks.resolveResult(userResolver),
      ],
      find: [authenticate("jwt")],
      get: [authenticate("jwt")],
      create: [],
      update: [authenticate("jwt")],
      patch: [authenticate("jwt")],
      remove: [authenticate("jwt")],
    },
    before: {
      all: [
        schemaHooks.validateQuery(userQueryValidator),
        schemaHooks.resolveQuery(userQueryResolver),
      ],
      find: [authenticate("jwt")],
      get: [authenticate("jwt")],
      create: [
        schemaHooks.validateData(userDataValidator),
        schemaHooks.resolveData(userDataResolver),
        //   async (context: HookContext) => {
        //   const role = await context.app.service('roles').find({query: { $limit: 1,slug: 'asset-owner'}});
        //   const numb = getOtp();
        //   context.data = {
        //     ...context.data,
        //     otp: numb,
        //     role: role?.data[0]?.id
        //   }
        // }
      ],
      patch: [
        hashPassword("password"),
        authenticate("jwt"),
        schemaHooks.validateData(userPatchValidator),
        schemaHooks.resolveData(userPatchResolver),
      ],
      remove: [],
    },
    after: {
      all: [protect("pin", "password")],
      create: [
        async (context: HookContext) => {
          const role = await context.app
            .service("roles")
            .get(context.result.role);
          if (
            role.slug === Roles.AssetOwner ||
            role.slug === Roles.BusinessOwner ||
            role.slug === Roles.GuestUser
          ) {
            sendEmail({
              toEmail: context.result.email,
              subject: "Verify your email",
              templateData: emailTemplates.otp(context.result.otp),
              receiptName: `${context.result.first_name} ${context.result.last_name}`,
            });
          }
          context.result.otp = null;
          context.result.password = null;
        },
        protect("password"),
      ],
      find: [protect("password", "otp")],
      get: [protect("password", "otp")],
      update: [protect("password", "otp")],
      patch: [protect("password", "otp")],
      remove: [],
    },
    error: {
      all: [],
      create: [
        async (context) => {
          const err = Object.keys(context.error.errors);

          if (context.error.code === 409 && err.includes("email")) {
            throw new Conflict("This email has been used");
          }

          return context;
        },
      ],
    },
  });

  //@ts-ignore
  app.use("/invite-in-house-manager", {
    async create(data: any, params: any) {
      try {
        const { email, first_name, last_name, phone_number } = data;

        try {
          await inhouseInviteValidator.validateAsync(data);
        } catch (validationError) {
          //@ts-ignore
          throw new BadRequest(validationError.details[0].message);
        }

        const usersService = app.service("users");

        // Check if user already exists
        const existingUser = await usersService.find({ query: { email } });
        if (existingUser.total > 0) {
          throw new Conflict("User with this email already exists");
        }

        // Get the In-House Manager role
        const rolesService = app.service("roles");
        const role = await rolesService.find({
          query: { slug: Roles.InHouseManager, $limit: 1 },
        });
        if (role.data.length === 0) {
          throw new BadRequest("In-House Manager role not found");
        }

        console.log(role, "........");

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
          in_house_inviter: params.user.id,
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
        console.log(error)
        if (error instanceof BadRequest || error instanceof Conflict) {
          throw error; // Re-throw these specific errors as they are already handled
        }
        console.error("Error in invite-in-house-manager service:", error);
        throw new GeneralError(
          "An unexpected error occurred while processing your request"
        );
      }
    },
  });
};

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    [userPath]: UserService;
  }
}
