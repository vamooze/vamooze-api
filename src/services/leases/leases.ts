// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  leasesDataValidator,
  leasesPatchValidator,
  leasesQueryValidator,
  leasesResolver,
  leasesExternalResolver,
  leasesDataResolver,
  leasesPatchResolver,
  leasesQueryResolver
} from './leases.schema'

import type { Application } from '../../declarations'
import { LeasesService, getOptions } from './leases.class'
import { leasesPath, leasesMethods } from './leases.shared'

export * from './leases.class'
export * from './leases.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const leases = (app: Application) => {
  // Register our service on the Feathers application
  app.use(leasesPath, new LeasesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: leasesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(leasesPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(leasesExternalResolver),
        schemaHooks.resolveResult(leasesResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(leasesQueryValidator), schemaHooks.resolveQuery(leasesQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(leasesDataValidator), schemaHooks.resolveData(leasesDataResolver)],
      patch: [schemaHooks.validateData(leasesPatchValidator), schemaHooks.resolveData(leasesPatchResolver)],
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
    [leasesPath]: LeasesService
  }
}
