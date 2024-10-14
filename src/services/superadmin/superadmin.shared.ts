// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  Superadmin,
  SuperadminData,
  SuperadminPatch,
  SuperadminQuery,
  SuperadminService
} from './superadmin.class'

export type { Superadmin, SuperadminData, SuperadminPatch, SuperadminQuery }

export type SuperadminClientService = Pick<
  SuperadminService<Params<SuperadminQuery>>,
  (typeof superadminMethods)[number]
>

export const superadminPath = 'superadmin'

export const superadminMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const superadminClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(superadminPath, connection.service(superadminPath), {
    methods: superadminMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [superadminPath]: SuperadminClientService
  }
}
