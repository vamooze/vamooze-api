// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  BusinessTypes,
  BusinessTypesData,
  BusinessTypesPatch,
  BusinessTypesQuery,
  BusinessTypesService
} from './business-types.class'

export type { BusinessTypes, BusinessTypesData, BusinessTypesPatch, BusinessTypesQuery }

export type BusinessTypesClientService = Pick<
  BusinessTypesService<Params<BusinessTypesQuery>>,
  (typeof businessTypesMethods)[number]
>

export const businessTypesPath = 'business-types'

export const businessTypesMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const businessTypesClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(businessTypesPath, connection.service(businessTypesPath), {
    methods: businessTypesMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [businessTypesPath]: BusinessTypesClientService
  }
}
