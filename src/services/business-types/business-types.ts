// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  businessTypesDataValidator,
  businessTypesPatchValidator,
  businessTypesQueryValidator,
  businessTypesResolver,
  businessTypesExternalResolver,
  businessTypesDataResolver,
  businessTypesPatchResolver,
  businessTypesQueryResolver
} from './business-types.schema'

import type { Application } from '../../declarations'
import { BusinessTypesService, getOptions } from './business-types.class'
import { businessTypesPath, businessTypesMethods } from './business-types.shared'

export * from './business-types.class'
export * from './business-types.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const businessTypes = (app: Application) => {
  // Register our service on the Feathers application
  app.use(businessTypesPath, new BusinessTypesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: businessTypesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(businessTypesPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(businessTypesExternalResolver),
        schemaHooks.resolveResult(businessTypesResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(businessTypesQueryValidator),
        schemaHooks.resolveQuery(businessTypesQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(businessTypesDataValidator),
        schemaHooks.resolveData(businessTypesDataResolver)
      ],
      patch: [
        schemaHooks.validateData(businessTypesPatchValidator),
        schemaHooks.resolveData(businessTypesPatchResolver)
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
    [businessTypesPath]: BusinessTypesService
  }
}
