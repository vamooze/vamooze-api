// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Roles, RolesData, RolesPatch, RolesQuery, RolesService } from './roles.class'

export type { Roles, RolesData, RolesPatch, RolesQuery }

export type RolesClientService = Pick<RolesService<Params<RolesQuery>>, (typeof rolesMethods)[number]>

export const rolesPath = 'roles'

export const rolesMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const rolesClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(rolesPath, connection.service(rolesPath), {
    methods: rolesMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [rolesPath]: RolesClientService
  }
}
