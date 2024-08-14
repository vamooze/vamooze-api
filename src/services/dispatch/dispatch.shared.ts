// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Dispatch, DispatchData, DispatchPatch, DispatchQuery, DispatchService } from './dispatch.class'

export type { Dispatch, DispatchData, DispatchPatch, DispatchQuery }

export type DispatchClientService = Pick<
  DispatchService<Params<DispatchQuery>>,
  (typeof dispatchMethods)[number]
>

export const dispatchPath = 'dispatch'

export const dispatchMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const dispatchClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(dispatchPath, connection.service(dispatchPath), {
    methods: dispatchMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [dispatchPath]: DispatchClientService
  }
}
