// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from "@feathersjs/authentication";
import { Request, Response, NextFunction } from 'express';
import { NotFound, BadRequest,Conflict, } from '@feathersjs/errors';
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

import type { Application } from "../../declarations";
import { BusinessService, getOptions } from "./business.class";
import { businessPath, businessMethods } from "./business.shared";
import { OAuthTypes, Roles } from "../../interfaces/constants";
import { getOtp, sendEmail } from "../../helpers/functions";
import { logger } from "../../logger";
import { createValidator } from "express-joi-validation";
import Joi from "joi";
import { Termii } from "../../helpers/termii";

export * from "./business.class";
export * from "./business.schema";

const validator = createValidator({ passError: true, statusCode: 400 });

const phoneRegex = /^\+?\d+$/;

const joi_phone_number_validator = Joi.string()
  .pattern(phoneRegex)
  .min(7)
  // .max(15)
  .required()
  .messages({
    "string.pattern.base":
      'Phone number must be a number and can only start with "+"',
    "string.min": "Phone number must be at least 7 digits long",
    // 'string.max': 'Phone number cannot be longer than 15 digits',
    "any.required": "Phone number is required",
  });

const schemas = {
  signup: Joi.object().keys({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    phone_number: Joi.string().optional().max(12),
    state: Joi.string().optional(),
    address: Joi.string().optional(),
    local_government_area: Joi.string().optional(),
  }),
  dispatch_signup: Joi.object().keys({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    phone_number: joi_phone_number_validator,
  }),
  dispatch_login: Joi.object().keys({
    phone_number: joi_phone_number_validator,
  }),
  complete_dispatch_login: Joi.object().keys({
    phone_number: joi_phone_number_validator,
    otp: Joi.number().required(),
  }),
  activateBusiness: Joi.object().keys({
    businessId: Joi.number().required()
  })
};



// A configure function that registers the service and its hooks via `app.configure`
export const business = (app: Application) => {

  const handleOtpDispatch = async (req: any, res: any) => {
    try {
      const User = app.service("users");
      const userDetails = await User.find({
        query: {
          phone_number: req.body.phone_number,
        },
      });
  
      if (userDetails?.data.length === 0) {
        throw new NotFound("Ouch! User not found");
      }
  
      req.body.otp = getOtp();
      await app
        .service("users")
        .patch(userDetails?.data[0]?.id, { otp: req.body.otp });
        
      const instance = new Termii(
        req.body.phone_number,
        `Your OTP is ${req.body.otp}`
      );
      await instance.sendSMS();
      res.json({ status: 200, message: "Otp sent successfully" });
    } catch (error) {
      res.json(error);
    }
  }

  const superAdminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('here in activating buisness', req)
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

  // Register our service on the Feathers application
  app.use(businessPath, new BusinessService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: businessMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  app.post(
    "/business/whitelabel/signup",
    validator.body(schemas.signup),
    async (req: any, res: any, next: any) => {
      try {
        const user = await app
          .service("users")
          .find({ query: { email: req.body.email } });

        if (user?.data?.length > 0) {
          throw new Conflict("User with this email already exists");
        }
        const role = await app
          .service("roles")
          .find({ query: { $limit: 1, slug: Roles.BusinessOwner } });
        if (role?.data?.length === 0) {
          throw new NotFound("Role does not exist");
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
    '/super-admin/activate-business',
    validator.body(schemas.activateBusiness),
    superAdminMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { businessId } = req.body;

        const businessService = app.service('business');
        const business = await businessService.get(businessId);

        if (!business) {
          throw new NotFound('Business not found');
        }

        if (business.active === true) {
          throw new BadRequest('Business is already active');
        }

        const updatedBusiness = await businessService.patch(businessId, { active: true });

        console.log('updatedBusiness', updatedBusiness)
        return res.json({ status: 200, data: updatedBusiness })
      } catch (error: any) {
        logger.error({
          message: error.message,
          stack: error.stack,
        });
        next(error);
      }
    }
  );
  
  app.post(
    "/dispatch/signup",
    validator.body(schemas.dispatch_signup),
    async (req: any, res: any, next: any) => {
      try {
        const phoneNumber = req.body.phone_number.startsWith("+")
          ? req.body.phone_number.slice(1)
          : req.body.phone_number;

        // Update the req.body.phone_number with the stripped phone number
        req.body.phone_number = phoneNumber;

        const user = await app
          .service("users")
          .find({ query: { phone_number: req.body.phone_number } });

        if (user?.data?.length > 0) {
          throw new Conflict("User with this phone number already exists");
        }

        const role = await app
          .service("roles")
          .find({ query: { $limit: 1, slug: Roles.Dispatch } });
        if (role?.data?.length === 0) {
          throw new NotFound("Role does not exist");
        }
        req.body.role = role?.data[0]?.id;
        req.body.otp = getOtp();
        req.body.password = Roles.Dispatch;
        const result = await app.service("users").create(req.body);

        const instance = new Termii(
          req.body.phone_number,
          `Your OTP is ${req.body.otp}`
        );
        await instance.sendSMS();
        res.json(result);
      } catch (error: any) {
        logger.error({
          message: error.message,
          stack: error.stack,
          phone_number: req.body.phone_number,
        });
        next(error);
      }
    }
  );

  app.post(
    "/auth/dispatch/initiate-login",
    validator.body(schemas.dispatch_login),
    handleOtpDispatch
  );
  
  app.post(
    "/auth/dispatch/resend-otp",
    validator.body(schemas.dispatch_login),
    handleOtpDispatch
  );

  app.post(
    "/auth/dispatch/complete-login",
    validator.body(schemas.complete_dispatch_login),
    async (req: any, res: any) => {
      try {
        const User = app.service("users");
        const userDetails = await User.find({
          query: {
            phone_number: req.body.phone_number,
            otp: req.body.otp,
          },
        });

        if (userDetails?.data.length === 0) {
          throw new NotFound("Ouch! Otp is incorrect");
        }

        await app.service("users").patch(userDetails?.data[0]?.id, { otp: 0 });

        const data = await app
          .service("authentication")
          .create({
            password: Roles.Dispatch,
            phone_number: req.body.phone_number,
            strategy: "phone",
          });
        return res.json({ status: 200, data });
      } catch (error) {
        res.json(error);
      }
    }
  );
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
