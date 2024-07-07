// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  requestsDataValidator,
  requestsPatchValidator,
  requestsQueryValidator,
  requestsResolver,
  requestsExternalResolver,
  requestsDataResolver,
  requestsPatchResolver,
  requestsQueryResolver
} from './requests.schema'

import type { Application } from '../../declarations'
import { RequestsService, getOptions } from './requests.class'
import { requestsPath, requestsMethods } from './requests.shared'

export * from './requests.class'
export * from './requests.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const requests = (app: Application) => {
  // Register our service on the Feathers application
  app.use(requestsPath, new RequestsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: requestsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(requestsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(requestsExternalResolver),
        schemaHooks.resolveResult(requestsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(requestsQueryValidator),
        schemaHooks.resolveQuery(requestsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(requestsDataValidator),
        schemaHooks.resolveData(requestsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(requestsPatchValidator),
        schemaHooks.resolveData(requestsPatchResolver)
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
    [requestsPath]: RequestsService
  }
}
