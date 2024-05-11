// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Assets, AssetsData, AssetsPatch, AssetsQuery, AssetsService } from './assets.class'

export type { Assets, AssetsData, AssetsPatch, AssetsQuery }

export type AssetsClientService = Pick<AssetsService<Params<AssetsQuery>>, (typeof assetsMethods)[number]>

export const assetsPath = 'assets'

export const assetsMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const assetsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(assetsPath, connection.service(assetsPath), {
    methods: assetsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [assetsPath]: AssetsClientService
  }
}
