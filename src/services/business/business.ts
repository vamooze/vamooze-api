// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  businessDataValidator,
  businessPatchValidator,
  businessQueryValidator,
  businessResolver,
  businessExternalResolver,
  businessDataResolver,
  businessPatchResolver,
  businessQueryResolver
} from './business.schema'

import type { Application } from '../../declarations'
import { BusinessService, getOptions } from './business.class'
import { businessPath, businessMethods } from './business.shared'
import {Conflict, NotFound} from "@feathersjs/errors";
import {OAuthTypes, Roles} from "../../interfaces/constants";
import {getOtp} from "../../helpers/functions";
import {logger} from "../../logger";
import {createValidator} from "express-joi-validation";
import Joi from "joi";
import {Termii} from "../../helpers/termii";

export * from './business.class'
export * from './business.schema'

const validator = createValidator({ passError: true, statusCode: 400 })
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
    phone_number: Joi.string().required().max(12)
  }),
  dispatch_login: Joi.object().keys({
    phone_number: Joi.string().required().max(12)
  }),
  complete_dispatch_login: Joi.object().keys({
    phone_number: Joi.string().required().max(12),
    otp: Joi.number().required()
  })
}

// A configure function that registers the service and its hooks via `app.configure`
export const business = (app: Application) => {
  // Register our service on the Feathers application
  app.use(businessPath, new BusinessService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: businessMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  app.post('/business/whitelabel/signup',  validator.body(schemas.signup), async (req: any, res: any, next: any) => {
    try {
      const user = await app.service('users').find({ query: { email: req.body.email } });

      if(user?.data?.length > 0) {
        throw new Conflict('User with this email already exists');
      }
      const role = await app.service('roles').find({query: { $limit: 1,slug: Roles.BusinessOwner}});
      if (role?.data?.length === 0) {
        throw new NotFound('Role does not exist');
      }
      req.body.role = role?.data[0]?.id;
      req.body.otp = getOtp();
      const result = await app.service('users').create(req.body);
      res.json(result);
    } catch (error: any) {
      logger.error({message: error.message, stack: error.stack, email: req.body.email});
      next(error);
    }
  });

  app.post('/dispatch/signup',  validator.body(schemas.dispatch_signup), async (req: any, res: any, next: any) => {
    try {
      const role = await app.service('roles').find({query: { $limit: 1,slug: Roles.Dispatch}});
      if (role?.data?.length === 0) {
        throw new NotFound('Role does not exist');
      }
      req.body.role = role?.data[0]?.id;
      req.body.otp = getOtp();
      req.body.password = Roles.Dispatch;
      console.log('===========================================req.body');
      console.log(req.body);
      console.log('===========================================req.body');
      const result = await app.service('users').create(req.body);
      const instance = new Termii(req.body.phone_number, `Your OTP is ${req.body.otp}`);
      await instance.sendSMS();
      res.json(result);
    } catch (error: any) {
      logger.error({message: error.message, stack: error.stack, phone_number: req.body.phone_number});
      next(error);
    }
  });

  app.post('/auth/dispatch/initiate-login', validator.body(schemas.dispatch_login), async (req: any, res: any) => {
    try {
      const User = app.service('users')
      const userDetails = await User.find({
        query: {
          phone_number: req.body.phone_number
        }
      })

      if (userDetails?.data.length === 0) {
        throw new NotFound('Ouch! User not found')
      }

      req.body.otp = getOtp();
      const result = await app.service('users').patch(userDetails?.data[0]?.id, {otp: req.body.otp});
      const instance = new Termii(req.body.phone_number, `Your OTP is ${req.body.otp}`);
      await instance.sendSMS();
      console.log('===========================================req.body');
      console.log(req.body);
      console.log('===========================================req.body');
      res.json({status: 200, message: "Otp sent successfully"});
      // const data = await app
      //     .service('authentication')
      //     .create({ password: Roles.Dispatch, phone_number: req.body.phone_number, strategy: 'phone' })
      // return res.json({ status: 200, data })
    } catch (error) {
      res.json(error)
    }
  })

  app.post('/auth/dispatch/complete-login', validator.body(schemas.complete_dispatch_login), async (req: any, res: any) => {
    try {
      const User = app.service('users')
      const userDetails = await User.find({
        query: {
          phone_number: req.body.phone_number,
          otp: req.body.otp
        }
      })

      if (userDetails?.data.length === 0) {
        throw new NotFound('Ouch! Otp is incorrect')
      }

      await app.service('users').patch(userDetails?.data[0]?.id, {otp: 0});

      const data = await app
          .service('authentication')
          .create({ password: Roles.Dispatch, phone_number: req.body.phone_number, strategy: 'phone' })
      return res.json({ status: 200, data })
    } catch (error) {
      res.json(error)
    }
  })
  // Initialize hooks
  app.service(businessPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(businessExternalResolver),
        schemaHooks.resolveResult(businessResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(businessQueryValidator),
        schemaHooks.resolveQuery(businessQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(businessDataValidator),
        schemaHooks.resolveData(businessDataResolver)
      ],
      patch: [
        schemaHooks.validateData(businessPatchValidator),
        schemaHooks.resolveData(businessPatchResolver)
      ],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [businessPath]: BusinessService
  }
}