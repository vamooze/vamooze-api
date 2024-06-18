// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  Maintenance,
  MaintenanceData,
  MaintenancePatch,
  MaintenanceQuery,
  MaintenanceService
} from './maintenance.class'

export type { Maintenance, MaintenanceData, MaintenancePatch, MaintenanceQuery }

export type MaintenanceClientService = Pick<
  MaintenanceService<Params<MaintenanceQuery>>,
  (typeof maintenanceMethods)[number]
>

export const maintenancePath = 'maintenance'

export const maintenanceMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const maintenanceClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(maintenancePath, connection.service(maintenancePath), {
    methods: maintenanceMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [maintenancePath]: MaintenanceClientService
  }
}
