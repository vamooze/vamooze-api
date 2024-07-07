// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type {
  BusinessDispatches,
  BusinessDispatchesData,
  BusinessDispatchesPatch,
  BusinessDispatchesQuery
} from './business-dispatches.schema'

export type { BusinessDispatches, BusinessDispatchesData, BusinessDispatchesPatch, BusinessDispatchesQuery }

export interface BusinessDispatchesParams extends KnexAdapterParams<BusinessDispatchesQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class BusinessDispatchesService<
  ServiceParams extends Params = BusinessDispatchesParams
> extends KnexService<
  BusinessDispatches,
  BusinessDispatchesData,
  BusinessDispatchesParams,
  BusinessDispatchesPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'business-dispatches'
  }
}
