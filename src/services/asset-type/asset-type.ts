// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  assetTypeDataValidator,
  assetTypePatchValidator,
  assetTypeQueryValidator,
  assetTypeResolver,
  assetTypeExternalResolver,
  assetTypeDataResolver,
  assetTypePatchResolver,
  assetTypeQueryResolver
} from './asset-type.schema'

import type { Application } from '../../declarations'
import { AssetTypeService, getOptions } from './asset-type.class'
import { assetTypePath, assetTypeMethods } from './asset-type.shared'

export * from './asset-type.class'
export * from './asset-type.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const assetType = (app: Application) => {
  // Register our service on the Feathers application
  app.use(assetTypePath, new AssetTypeService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: assetTypeMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(assetTypePath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(assetTypeExternalResolver),
        schemaHooks.resolveResult(assetTypeResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(assetTypeQueryValidator),
        schemaHooks.resolveQuery(assetTypeQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(assetTypeDataValidator),
        schemaHooks.resolveData(assetTypeDataResolver)
      ],
      patch: [
        schemaHooks.validateData(assetTypePatchValidator),
        schemaHooks.resolveData(assetTypePatchResolver)
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
    [assetTypePath]: AssetTypeService
  }
}
