// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  maintenanceDataValidator,
  maintenancePatchValidator,
  maintenanceQueryValidator,
  maintenanceResolver,
  maintenanceExternalResolver,
  maintenanceDataResolver,
  maintenancePatchResolver,
  maintenanceQueryResolver
} from './maintenance.schema'

import type { Application } from '../../declarations'
import { MaintenanceService, getOptions } from './maintenance.class'
import { maintenancePath, maintenanceMethods } from './maintenance.shared'

export * from './maintenance.class'
export * from './maintenance.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const maintenance = (app: Application) => {
  // Register our service on the Feathers application
  app.use(maintenancePath, new MaintenanceService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: maintenanceMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(maintenancePath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(maintenanceExternalResolver),
        schemaHooks.resolveResult(maintenanceResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(maintenanceQueryValidator),
        schemaHooks.resolveQuery(maintenanceQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(maintenanceDataValidator),
        schemaHooks.resolveData(maintenanceDataResolver)
      ],
      patch: [
        schemaHooks.validateData(maintenancePatchValidator),
        schemaHooks.resolveData(maintenancePatchResolver)
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
    [maintenancePath]: MaintenanceService
  }
}
