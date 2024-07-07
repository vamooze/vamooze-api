// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  businessSettingsDataValidator,
  businessSettingsPatchValidator,
  businessSettingsQueryValidator,
  businessSettingsResolver,
  businessSettingsExternalResolver,
  businessSettingsDataResolver,
  businessSettingsPatchResolver,
  businessSettingsQueryResolver
} from './business-settings.schema'

import type { Application } from '../../declarations'
import { BusinessSettingsService, getOptions } from './business-settings.class'
import { businessSettingsPath, businessSettingsMethods } from './business-settings.shared'
import {createValidator} from "express-joi-validation";
import Joi from "joi";

export * from './business-settings.class'
export * from './business-settings.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const businessSettings = (app: Application) => {
  // Register our service on the Feathers application
  app.use(businessSettingsPath, new BusinessSettingsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: businessSettingsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(businessSettingsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(businessSettingsExternalResolver),
        schemaHooks.resolveResult(businessSettingsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(businessSettingsQueryValidator),
        schemaHooks.resolveQuery(businessSettingsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(businessSettingsDataValidator),
        schemaHooks.resolveData(businessSettingsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(businessSettingsPatchValidator),
        schemaHooks.resolveData(businessSettingsPatchResolver)
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
    [businessSettingsPath]: BusinessSettingsService
  }
}
