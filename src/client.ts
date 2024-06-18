// For more information about this file see https://dove.feathersjs.com/guides/cli/client.html
import { feathers } from '@feathersjs/feathers'
import type { TransportConnection, Application } from '@feathersjs/feathers'
import authenticationClient from '@feathersjs/authentication-client'
import type { AuthenticationClientOptions } from '@feathersjs/authentication-client'

import { maintenanceClient } from './services/maintenance/maintenance.shared'
export type {
  Maintenance,
  MaintenanceData,
  MaintenanceQuery,
  MaintenancePatch
} from './services/maintenance/maintenance.shared'

import { leasePreferencesClient } from './services/lease-preferences/lease-preferences.shared'
export type {
  LeasePreferences,
  LeasePreferencesData,
  LeasePreferencesQuery,
  LeasePreferencesPatch
} from './services/lease-preferences/lease-preferences.shared'

import { leasesClient } from './services/leases/leases.shared'
export type { Leases, LeasesData, LeasesQuery, LeasesPatch } from './services/leases/leases.shared'

import { messagesClient } from './services/messages/messages.shared'
export type {
  Messages,
  MessagesData,
  MessagesQuery,
  MessagesPatch
} from './services/messages/messages.shared'

import { assetsClient } from './services/assets/assets.shared'
export type { Assets, AssetsData, AssetsQuery, AssetsPatch } from './services/assets/assets.shared'

import { assetTypeClient } from './services/asset-type/asset-type.shared'
export type {
  AssetType,
  AssetTypeData,
  AssetTypeQuery,
  AssetTypePatch
} from './services/asset-type/asset-type.shared'

import { rolesClient } from './services/roles/roles.shared'
export type { Roles, RolesData, RolesQuery, RolesPatch } from './services/roles/roles.shared'

import { userClient } from './services/users/users.shared'
export type { User, UserData, UserQuery, UserPatch } from './services/users/users.shared'

export interface Configuration {
  connection: TransportConnection<ServiceTypes>
}

export interface ServiceTypes {}

export type ClientApplication = Application<ServiceTypes, Configuration>

/**
 * Returns a typed client for the vamooze app.
 *
 * @param connection The REST or Socket.io Feathers client connection
 * @param authenticationOptions Additional settings for the authentication client
 * @see https://dove.feathersjs.com/api/client.html
 * @returns The Feathers client application
 */
export const createClient = <Configuration = any,>(
  connection: TransportConnection<ServiceTypes>,
  authenticationOptions: Partial<AuthenticationClientOptions> = {}
) => {
  const client: ClientApplication = feathers()

  client.configure(connection)
  client.configure(authenticationClient(authenticationOptions))
  client.set('connection', connection)

  client.configure(userClient)
  client.configure(rolesClient)
  client.configure(assetTypeClient)
  client.configure(assetsClient)
  client.configure(messagesClient)
  client.configure(leasesClient)
  client.configure(leasePreferencesClient)
  client.configure(maintenanceClient)
  return client
}
