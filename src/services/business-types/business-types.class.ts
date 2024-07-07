// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type {
  BusinessTypes,
  BusinessTypesData,
  BusinessTypesPatch,
  BusinessTypesQuery
} from './business-types.schema'

export type { BusinessTypes, BusinessTypesData, BusinessTypesPatch, BusinessTypesQuery }

export interface BusinessTypesParams extends KnexAdapterParams<BusinessTypesQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class BusinessTypesService<ServiceParams extends Params = BusinessTypesParams> extends KnexService<
  BusinessTypes,
  BusinessTypesData,
  BusinessTypesParams,
  BusinessTypesPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'business_types'
  }
}
