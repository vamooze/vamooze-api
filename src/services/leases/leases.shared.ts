// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Leases, LeasesData, LeasesPatch, LeasesQuery, LeasesService } from './leases.class'

export type { Leases, LeasesData, LeasesPatch, LeasesQuery }

export type LeasesClientService = Pick<LeasesService<Params<LeasesQuery>>, (typeof leasesMethods)[number]>

export const leasesPath = 'leases'

export const leasesMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const leasesClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(leasesPath, connection.service(leasesPath), {
    methods: leasesMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [leasesPath]: LeasesClientService
  }
}
