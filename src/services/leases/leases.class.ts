// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { Leases, LeasesData, LeasesPatch, LeasesQuery } from './leases.schema'

export type { Leases, LeasesData, LeasesPatch, LeasesQuery }

export interface LeasesParams extends KnexAdapterParams<LeasesQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class LeasesService<ServiceParams extends Params = LeasesParams> extends KnexService<
  Leases,
  LeasesData,
  LeasesParams,
  LeasesPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'leases'
  }
}
