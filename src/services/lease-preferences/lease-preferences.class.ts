// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type {
  LeasePreferences,
  LeasePreferencesData,
  LeasePreferencesPatch,
  LeasePreferencesQuery
} from './lease-preferences.schema'

export type { LeasePreferences, LeasePreferencesData, LeasePreferencesPatch, LeasePreferencesQuery }

export interface LeasePreferencesParams extends KnexAdapterParams<LeasePreferencesQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class LeasePreferencesService<
  ServiceParams extends Params = LeasePreferencesParams
> extends KnexService<
  LeasePreferences,
  LeasePreferencesData,
  LeasePreferencesParams,
  LeasePreferencesPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'lease_preferences'
  }
}
