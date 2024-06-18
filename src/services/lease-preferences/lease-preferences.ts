// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  leasePreferencesDataValidator,
  leasePreferencesPatchValidator,
  leasePreferencesQueryValidator,
  leasePreferencesResolver,
  leasePreferencesExternalResolver,
  leasePreferencesDataResolver,
  leasePreferencesPatchResolver,
  leasePreferencesQueryResolver
} from './lease-preferences.schema'

import type {Application, HookContext} from '../../declarations'
import { LeasePreferencesService, getOptions } from './lease-preferences.class'
import { leasePreferencesPath, leasePreferencesMethods } from './lease-preferences.shared'
import {NotFound, Conflict} from "@feathersjs/errors";

export * from './lease-preferences.class'
export * from './lease-preferences.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const leasePreferences = (app: Application) => {
  // Register our service on the Feathers application
  app.use(leasePreferencesPath, new LeasePreferencesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: leasePreferencesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(leasePreferencesPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(leasePreferencesExternalResolver),
        schemaHooks.resolveResult(leasePreferencesResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(leasePreferencesQueryValidator),
        schemaHooks.resolveQuery(leasePreferencesQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(leasePreferencesDataValidator),
        schemaHooks.resolveData(leasePreferencesDataResolver),
          async (context: HookContext) => {
        let asset;
        let asset_owner;
        try{
           asset = await context.app.service('assets').get(context.data.asset);
        }catch (error: any) {
            throw new NotFound('Asset does not exist');
        }

        try{
            asset_owner = await context.app.service('users').get(context.data.asset_owner);
        }catch (error: any) {
            throw new NotFound('Asset owner does not exist');
        }
        const lease_preferences = await context.app.service('lease-preferences').find({query: {asset: asset.id, asset_owner: asset_owner.id}});
        if (lease_preferences?.data?.length > 0) {
          throw new Conflict('Lease preferences already exists');
        }
        return context
        }
      ],
      patch: [
        schemaHooks.validateData(leasePreferencesPatchValidator),
        schemaHooks.resolveData(leasePreferencesPatchResolver)
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
    [leasePreferencesPath]: LeasePreferencesService
  }
}
