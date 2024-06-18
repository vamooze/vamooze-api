// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  LeasePreferences,
  LeasePreferencesData,
  LeasePreferencesPatch,
  LeasePreferencesQuery,
  LeasePreferencesService
} from './lease-preferences.class'

export type { LeasePreferences, LeasePreferencesData, LeasePreferencesPatch, LeasePreferencesQuery }

export type LeasePreferencesClientService = Pick<
  LeasePreferencesService<Params<LeasePreferencesQuery>>,
  (typeof leasePreferencesMethods)[number]
>

export const leasePreferencesPath = 'lease-preferences'

export const leasePreferencesMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const leasePreferencesClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(leasePreferencesPath, connection.service(leasePreferencesPath), {
    methods: leasePreferencesMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [leasePreferencesPath]: LeasePreferencesClientService
  }
}
