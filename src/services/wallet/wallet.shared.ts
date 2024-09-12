// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Wallet, WalletData, WalletPatch, WalletQuery, WalletService } from './wallet.class'

export type { Wallet, WalletData, WalletPatch, WalletQuery }

export type WalletClientService = Pick<WalletService<Params<WalletQuery>>, (typeof walletMethods)[number]>

export const walletPath = 'wallet'

export const walletMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const walletClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(walletPath, connection.service(walletPath), {
    methods: walletMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [walletPath]: WalletClientService
  }
}
