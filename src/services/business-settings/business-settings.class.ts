// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type {
  BusinessSettings,
  BusinessSettingsData,
  BusinessSettingsPatch,
  BusinessSettingsQuery
} from './business-settings.schema'

export type { BusinessSettings, BusinessSettingsData, BusinessSettingsPatch, BusinessSettingsQuery }

export interface BusinessSettingsParams extends KnexAdapterParams<BusinessSettingsQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class BusinessSettingsService<
  ServiceParams extends Params = BusinessSettingsParams
> extends KnexService<
  BusinessSettings,
  BusinessSettingsData,
  BusinessSettingsParams,
  BusinessSettingsPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'business_settings'
  }
}
