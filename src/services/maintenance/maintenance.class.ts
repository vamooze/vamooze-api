// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'

import type { Application } from '../../declarations'
import type { Maintenance, MaintenanceData, MaintenancePatch, MaintenanceQuery } from './maintenance.schema'

export type { Maintenance, MaintenanceData, MaintenancePatch, MaintenanceQuery }

export interface MaintenanceParams extends KnexAdapterParams<MaintenanceQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class MaintenanceService<ServiceParams extends Params = MaintenanceParams> extends KnexService<
  Maintenance,
  MaintenanceData,
  MaintenanceParams,
  MaintenancePatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'maintenance'
  }
}
