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


  async approveRider(id: number, adminId: number, status: ApprovalStatus, params?: DispatchParams) {
    const rider = await this.get(id)
    if (!rider) {
      throw new NotFound(`Dispatch rider with id ${id} not found`)
    }

    if (rider.approval_status !== ApprovalStatus.PENDING) {
      throw new Forbidden('This dispatch rider has already been processed')
    }

    const updatedRider = await this.patch(id, {
      approval_status: status,
      approved_by: adminId,
      approval_date: new Date().toISOString()
    }, params)

    return updatedRider
  }

}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'dispatch'
  }
}
