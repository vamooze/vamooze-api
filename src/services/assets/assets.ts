// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  assetsDataValidator,
  assetsPatchValidator,
  assetsQueryValidator,
  assetsResolver,
  assetsExternalResolver,
  assetsDataResolver,
  assetsPatchResolver,
  assetsQueryResolver
} from './assets.schema'

import {Application, HookContext} from '../../declarations'
import { AssetsService, getOptions } from './assets.class'
import { assetsPath, assetsMethods } from './assets.shared'

export * from './assets.class'
export * from './assets.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const assets = (app: Application) => {
  // Register our service on the Feathers application
  app.use(assetsPath, new AssetsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: assetsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(assetsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(assetsExternalResolver),
        schemaHooks.resolveResult(assetsResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(assetsQueryValidator), schemaHooks.resolveQuery(assetsQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(assetsDataValidator), schemaHooks.resolveData(assetsDataResolver), async (context: HookContext) => {
        context.data = {
          ...context.data,
          asset_image: JSON.stringify(context.data.asset_image)
        }
      }],
      patch: [schemaHooks.validateData(assetsPatchValidator), schemaHooks.resolveData(assetsPatchResolver)],
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
    [assetsPath]: AssetsService
  }
}
