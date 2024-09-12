// For more information about this file see https://dove.feathersjs.com/guides/cli/client.html
import { feathers } from '@feathersjs/feathers'
import type { TransportConnection, Application } from '@feathersjs/feathers'
import authenticationClient from '@feathersjs/authentication-client'
import type { AuthenticationClientOptions } from '@feathersjs/authentication-client'

import { transactionsClient } from './services/transactions/transactions.shared'
export type {
  Transactions,
  TransactionsData,
  TransactionsQuery,
  TransactionsPatch
} from './services/transactions/transactions.shared'

import { walletClient } from './services/wallet/wallet.shared'
export type { Wallet, WalletData, WalletQuery, WalletPatch } from './services/wallet/wallet.shared'

import { dispatchClient } from './services/dispatch/dispatch.shared'
export type {
  Dispatch,
  DispatchData,
  DispatchQuery,
  DispatchPatch
} from './services/dispatch/dispatch.shared'

import { requestsClient } from './services/requests/requests.shared'
export type {
  Requests,
  RequestsData,
  RequestsQuery,
  RequestsPatch
} from './services/requests/requests.shared'

import { businessDispatchesClient } from './services/business-dispatches/business-dispatches.shared'
export type {
  BusinessDispatches,
  BusinessDispatchesData,
  BusinessDispatchesQuery,
  BusinessDispatchesPatch
} from './services/business-dispatches/business-dispatches.shared'

import { businessSettingsClient } from './services/business-settings/business-settings.shared'
export type {
  BusinessSettings,
  BusinessSettingsData,
  BusinessSettingsQuery,
  BusinessSettingsPatch
} from './services/business-settings/business-settings.shared'

import { businessTypesClient } from './services/business-types/business-types.shared'
export type {
  BusinessTypes,
  BusinessTypesData,
  BusinessTypesQuery,
  BusinessTypesPatch
} from './services/business-types/business-types.shared'

import { businessClient } from './services/business/business.shared'
export type {
  Business,
  BusinessData,
  BusinessQuery,
  BusinessPatch
} from './services/business/business.shared'

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
  client.configure(businessClient)
  client.configure(businessTypesClient)
  client.configure(businessSettingsClient)
  client.configure(businessDispatchesClient)
  client.configure(requestsClient)
  client.configure(dispatchClient)
  client.configure(walletClient)
  client.configure(transactionsClient)
  return client
}
