// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'
import { NotFound, Forbidden } from '@feathersjs/errors'
import { ApprovalStatus } from './dispatch.schema'
import type { Application } from '../../declarations'
import type { Dispatch, DispatchData, DispatchPatch, DispatchQuery } from './dispatch.schema'

export type { Dispatch, DispatchData, DispatchPatch, DispatchQuery }

export interface DispatchParams extends KnexAdapterParams<DispatchQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class DispatchService<ServiceParams extends Params = DispatchParams> extends KnexService<
  Dispatch,
  DispatchData,
  DispatchParams,
  DispatchPatch
> {

}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'dispatch'
  }
}
