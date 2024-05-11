// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  AssetType,
  AssetTypeData,
  AssetTypePatch,
  AssetTypeQuery,
  AssetTypeService
} from './asset-type.class'

export type { AssetType, AssetTypeData, AssetTypePatch, AssetTypeQuery }

export type AssetTypeClientService = Pick<
  AssetTypeService<Params<AssetTypeQuery>>,
  (typeof assetTypeMethods)[number]
>

export const assetTypePath = 'asset-type'

export const assetTypeMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const assetTypeClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(assetTypePath, connection.service(assetTypePath), {
    methods: assetTypeMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [assetTypePath]: AssetTypeClientService
  }
}
