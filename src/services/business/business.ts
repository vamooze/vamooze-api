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

import { HookContext } from "../../declarations";
import type { Application } from "../../declarations";
import { BusinessService, getOptions } from "./business.class";
import { businessPath, businessMethods } from "./business.shared";
import { OAuthTypes, Roles } from "../../interfaces/constants";
import { getOtp, sendEmail, isVerified } from "../../helpers/functions";
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


// A configure function that registers the service and its hooks via `app.configure`
export const business = (app: Application) => {


  const superAdminMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      //@ts-ignore
      console.log("here in activating buisness", req.user, ".......");
      // const User = app.service("users");
      // const userDetails = await User.find({
      //   query: {
      //     phone_number: req.body.phone_number,
      //   },
      // });
      // Fetch the user's role from the database
      // const app = req.app;
      // const userService = app.service('users');
      // const userDetails = await userService.get(user.id);

      // if (!userDetails) {
      //   throw new NotAuthorized('User not found');
      // }

      // Fetch the role details
      // const roleService = app.service('roles');
      // const roleDetails = await roleService.get(userDetails.role);

      // if (!roleDetails || roleDetails.slug !== 'super-admin') {
      //   throw new NotAuthorized('Super Admin access required');
      // }

      // If we reach here, the user is a super admin
      next();
    } catch (error) {
      next(error);
    }
  };

 
  app.post(
    "/business/whitelabel/signup",
    validator.body(schemas.signup),
    async (req: any, res: any, next: any) => {
      try {
        const user = await app
          .service("users")
          .find({ query: { email: req.body.email } });

        if (user?.data?.length > 0) {
          return res.status(409).json({
            status: 409,
            message: "User with this email already exists",
          });
        }
        const role = await app
          .service("roles")
          .find({ query: { $limit: 1, slug: Roles.BusinessOwner } });
        if (role?.data?.length === 0) {
          return res.status(404).json({
            status: 404,
            message: "Role does not exist",
          });
        }
        req.body.role = role?.data[0]?.id;
        req.body.otp = getOtp();
        const result = await app.service("users").create(req.body);
        res.json(result);
      } catch (error: any) {
        logger.error({
          message: error.message,
          stack: error.stack,
          email: req.body.email,
        });
        next(error);
      }
    }
  );

  app.patch(
    "/super-admin/activate-business",
    superAdminMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { businessId } = req.body;

        const businessService = app.service("business");

        const business = await businessService.get(businessId);

        if (!business) {
          return res.status(404).json({
            status: 404,
            message: "Business not found",
          });
        }

        if (business.active === true) {
          return res.status(400).json({
            status: 400,
            message: "Business is already active",
          });
        }

        const updatedBusiness = await businessService.patch(businessId, {
          active: true,
        });

        sendEmail({
          //@ts-ignore
          toEmail: updatedBusiness?.contact?.email,
          subject: "Business Approval",
          templateData: emailTemplates.businessApproval(),
          //@ts-ignore
          receiptName: updatedBusiness?.name,
        });

        return res.status(200).json({
          status: 200,
          message: "Business activated successfully",
          data: updatedBusiness,
        });
      } catch (error: any) {
        logger.error({
          message: error.message,
          stack: error.stack,
        });

        return res.status(500).json({
          status: 500,
          message: "An unexpected error occurred while activating the business",
        });
      }
    }
  );


   // Register our service on the Feathers application
   app.use(businessPath, new BusinessService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: businessMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });

  // Initialize hooks
  app.service(businessPath).hooks({
    around: {
      all: [
        authenticate("jwt"),
        schemaHooks.resolveExternal(businessExternalResolver),
        schemaHooks.resolveResult(businessResolver),
      ],
    },
    before: {
      all: [
        authenticate("jwt"),
        schemaHooks.validateQuery(businessQueryValidator),
        schemaHooks.resolveQuery(businessQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(businessDataValidator),
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
};

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    [businessPath]: BusinessService;
  }
}
