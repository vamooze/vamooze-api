// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from "@feathersjs/authentication";
import { Request, Response, NextFunction } from "express";
import { NotFound, BadRequest, Conflict } from "@feathersjs/errors";
import { hooks as schemaHooks } from "@feathersjs/schema";
import emailTemplates from "../../helpers/emailTemplates";
import {
  businessDataValidator,
  businessPatchValidator,
  businessQueryValidator,
  businessResolver,
  businessExternalResolver,
  businessDataResolver,
  businessPatchResolver,
  businessQueryResolver,
} from "./business.schema";
import { v4 as uuidv4 } from "uuid";

import type { Application } from "../../declarations";
import { BusinessService, getOptions } from "./business.class";
import { businessPath, businessMethods } from "./business.shared";
import { getOtp, sendEmail, isVerified } from "../../helpers/functions";
import { checkPermission } from "../../helpers/checkPermission";
import { Roles } from "../../interfaces/constants";

import { logger } from "../../logger";
import { createValidator } from "express-joi-validation";
import Joi from "joi";
import { Termii } from "../../helpers/termii";

export * from "./business.class";
export * from "./business.schema";

const validator = createValidator({ passError: true, statusCode: 400 });

const phoneRegex = /^\+\d{7,15}$/;

const joi_phone_number_validator = Joi.string()
  .pattern(phoneRegex)
  .required()
  .messages({
    "string.pattern.base":
      'Phone number must start with "+" followed by 7 to 15 digits',
    "any.required": "Phone number is required",
  });

const schemas = {
  signup: Joi.object().keys({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    phone_number: joi_phone_number_validator,
    state: Joi.string().optional(),
    address: Joi.string().optional(),
    local_government_area: Joi.string().optional(),
  }),
  activateBusiness: Joi.object().keys({
    businessId: Joi.number().required(),
  }),
};

export const business = (app: Application) => {
  const options = getOptions(app);
  // Register our service on the Feathers application
  app.use(businessPath, new BusinessService(options, app), {
    // A list of all methods this service exposes externally
    methods: businessMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });

  // Initialize hooks
  app.service(businessPath).hooks({
    before: {
      all: [
        authenticate("jwt"),
        schemaHooks.validateQuery(businessQueryValidator),
        schemaHooks.resolveQuery(businessQueryResolver),
      ],
      find: [checkPermission([Roles.SuperAdmin, Roles.BusinessOwner])],
      get: [],
      create: [
        async (context) => {
          const { data } = context;
         //@ts-ignore
          context.data = {
            ...context.data,
             //@ts-ignore
            slug: 'lol'
          };
          return context;
        },
        checkPermission([Roles.SuperAdmin, Roles.BusinessOwner]),
        schemaHooks.validateData(businessDataValidator), // validator needs a slug
        schemaHooks.resolveData(businessDataResolver),
      ],
      patch: [
        schemaHooks.validateData(businessPatchValidator),
        schemaHooks.resolveData(businessPatchResolver),
      ],
      remove: [],
    },
    after: {
      all: [],
    },
    error: {
      all: [],
    },
  });

  app.post(
    "/business/whitelabel/signup",
    validator.body(schemas.signup),
    async (req: any, res: any) => {
      try {
        const businessService = app.service("business") as BusinessService;
        const data = await businessService.signup(req.body);
        return res.status(200).json({
          status: 200,
          success: true,
          message: "Signup successful",
          data,
        });
      } catch (error) {
        if (error instanceof BadRequest) {
          return res.status(400).json({
            status: 400,
            success: false,
            message: error.message,
          });
        } else {
          return res.status(500).json({
            status: 500,
            success: false,
            message: "An unexpected error occurred",
          });
        }
      }
    }
  );

  //@ts-ignore
  app.use(`business/:businessId/toggle-status`, {
    async patch(id: string, data: any, params: any) {
      const businessService = app.service("business") as BusinessService;
      return await businessService.toggleStatus(data, params.route.businessId);
    },
  });

  //@ts-ignore
  app.service("business/:businessId/toggle-status").hooks({
    before: {
      all: [checkPermission(Roles.SuperAdmin)],
    },
  });

   //@ts-ignore
   app.use(`/business-signup-dashboard-customization`, {
    async find(params: any) {
      const { query } = params;
      const { slug } = query;

      const businessData = await app
        .service("business")
        .find({ query: { slug } });

      if (!businessData || businessData.total === 0) {
        return {
          success: true,
          code: 404,
          message: "Business with slug not found",
          data: [],
        };
      }

      return {
        success: true,
        code: 200,
        message: "Customized business data retrieved successfully",
        data: businessData,
      };
    },
  });


};

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    [businessPath]: BusinessService;
  }
}
