// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Requests, RequestsData, RequestsPatch, RequestsQuery, RequestsService } from './requests.class'

export type { Requests, RequestsData, RequestsPatch, RequestsQuery }

export type RequestsClientService = Pick<
  RequestsService<Params<RequestsQuery>>,
  (typeof requestsMethods)[number]
>

export const requestsPath = 'requests'

export const requestsMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const requestsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(requestsPath, connection.service(requestsPath), {
    methods: requestsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [requestsPath]: RequestsClientService
  }
}
