// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  BusinessDispatches,
  BusinessDispatchesData,
  BusinessDispatchesPatch,
  BusinessDispatchesQuery,
  BusinessDispatchesService
} from './business-dispatches.class'

export type { BusinessDispatches, BusinessDispatchesData, BusinessDispatchesPatch, BusinessDispatchesQuery }

export type BusinessDispatchesClientService = Pick<
  BusinessDispatchesService<Params<BusinessDispatchesQuery>>,
  (typeof businessDispatchesMethods)[number]
>

export const businessDispatchesPath = 'business-dispatches'

export const businessDispatchesMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const businessDispatchesClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(businessDispatchesPath, connection.service(businessDispatchesPath), {
    methods: businessDispatchesMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [businessDispatchesPath]: BusinessDispatchesClientService
  }
}
