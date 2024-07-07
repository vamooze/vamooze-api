// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  businessDispatchesDataValidator,
  businessDispatchesPatchValidator,
  businessDispatchesQueryValidator,
  businessDispatchesResolver,
  businessDispatchesExternalResolver,
  businessDispatchesDataResolver,
  businessDispatchesPatchResolver,
  businessDispatchesQueryResolver
} from './business-dispatches.schema'

import type { Application } from '../../declarations'
import { BusinessDispatchesService, getOptions } from './business-dispatches.class'
import { businessDispatchesPath, businessDispatchesMethods } from './business-dispatches.shared'

export * from './business-dispatches.class'
export * from './business-dispatches.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const businessDispatches = (app: Application) => {
  // Register our service on the Feathers application
  app.use(businessDispatchesPath, new BusinessDispatchesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: businessDispatchesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(businessDispatchesPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(businessDispatchesExternalResolver),
        schemaHooks.resolveResult(businessDispatchesResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(businessDispatchesQueryValidator),
        schemaHooks.resolveQuery(businessDispatchesQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(businessDispatchesDataValidator),
        schemaHooks.resolveData(businessDispatchesDataResolver)
      ],
      patch: [
        schemaHooks.validateData(businessDispatchesPatchValidator),
        schemaHooks.resolveData(businessDispatchesPatchResolver)
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
    [businessDispatchesPath]: BusinessDispatchesService
  }
}
