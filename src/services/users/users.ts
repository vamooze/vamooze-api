// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  userDataValidator,
  userPatchValidator,
  userQueryValidator,
  userResolver,
  userExternalResolver,
  userDataResolver,
  userPatchResolver,
  userQueryResolver
} from './users.schema'

import {Application, HookContext} from '../../declarations'
import { UserService, getOptions } from './users.class'
import { userPath, userMethods } from './users.shared'
import { checkPermission } from '../../helpers/checkPermission'
import {getOtp, isVerified, sendEmail} from '../../helpers/functions'
import {TemplateName, TemplateType} from "../../interfaces/constants";

const { protect, hashPassword } = require('@feathersjs/authentication-local').hooks;

export * from './users.class'
export * from './users.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const user = (app: Application) => {
  // Register our service on the Feathers application
  app.use(userPath, new UserService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: userMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(userPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(userExternalResolver), schemaHooks.resolveResult(userResolver)],
      find: [authenticate('jwt')],
      get: [authenticate('jwt')],
      create: [],
      update: [authenticate('jwt')],
      patch: [authenticate('jwt')],
      remove: [authenticate('jwt')]
    },
    before: {
      all: [schemaHooks.validateQuery(userQueryValidator), schemaHooks.resolveQuery(userQueryResolver)],
      find: [authenticate('jwt')],
      get: [authenticate('jwt')],
      create: [schemaHooks.validateData(userDataValidator), schemaHooks.resolveData(userDataResolver), async (context: HookContext) => {
        const role = await context.app.service('roles').find({query: { $limit: 1,slug: 'user'}});
        const numb = getOtp();
        context.data = {
          ...context.data,
          otp: numb,
          role: role.data[0].id
        }
      }],
      patch: [hashPassword('password'), authenticate('jwt'), schemaHooks.validateData(userPatchValidator), schemaHooks.resolveData(userPatchResolver)],
      remove: []
    },
    after: {
      all: [protect('pin', 'password')],
      create: [async (context: HookContext) => {
        const role = await context.app.service('roles').get(context.result.role)
        if(role.slug === 'user') {
            sendEmail({
              toEmail: context.result.email,
              subject: 'Verify your email',
              templateName: TemplateType.Otp,
              templateData: [{ name: TemplateName.Otp, content: context.result.otp }]
            });
        }
        context.result.otp = null;
      }],
      find: [protect('otp')],
      get: [protect('otp')],
      update: [],
      patch: [],
      remove: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [userPath]: UserService
  }
}
