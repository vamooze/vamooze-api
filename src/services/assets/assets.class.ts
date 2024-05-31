// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Id, Params} from '@feathersjs/feathers'
import {KnexService} from '@feathersjs/knex'
import type {KnexAdapterParams, KnexAdapterOptions} from '@feathersjs/knex'

import type {Application} from '../../declarations'
import type {Assets, AssetsData, AssetsPatch, AssetsQuery} from './assets.schema'
import {AdapterQuery} from "@feathersjs/adapter-commons";

export type {Assets, AssetsData, AssetsPatch, AssetsQuery}

export interface AssetsParams extends KnexAdapterParams<AssetsQuery> {
}

// By default, calls the standard Knex adapter service methods but can be customized with your own functionality.
export class AssetsService<ServiceParams extends Params = AssetsParams> extends KnexService<
    Assets
> {
  createQuery(params: KnexAdapterParams<AdapterQuery>) {
    const query = super.createQuery(params)

    query.join('users as person', 'assets.user', 'person.id')
    query.join('asset-type as asset-types', 'assets.asset_type', 'asset-types.id')

    return query
  }
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'assets'
  }
}
