// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex'
import { initializeTransaction } from '../../helpers/functions'
import type { Application } from '../../declarations'
import type { Wallet, WalletData, WalletPatch, WalletQuery } from './wallet.schema'

export type { Wallet, WalletData, WalletPatch, WalletQuery }

export interface WalletParams extends KnexAdapterParams<WalletQuery> {}


// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class WalletService<ServiceParams extends Params = WalletParams> extends KnexService<
  Wallet,
  WalletData,
  WalletParams,
  WalletPatch
> {

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options);
    //@ts-ignore
    this.app = app;
  }

  async fundWallet(userId: number, amount: number, params: Params) {
    //@ts-ignore
    const knex = this.app.get('knexClient');
  
    return knex.transaction(async (trx: any) => {
      // Get user's wallet
      const [wallet] = await trx('wallets').where({ user_id: userId });
      // if (!wallet) throw new Error('Wallet not found');

      // Get user's email
      const user = await trx('users').where({ id: userId }).first();
      if (!user) throw new Error('User not found');

      // Initialize Paystack transaction
      const paystackResponse = await initializeTransaction(user.email, amount);

      // Create a pending transaction
      await trx('transactions').insert({
        wallet_id: wallet.id,
        type: 'deposit',
        amount,
        status: 'pending',
        reference: paystackResponse.data.reference,
        metadata: JSON.stringify(paystackResponse.data)
      });

      // Return the authorization URL
      return paystackResponse.data.authorization_url;
    });
  }

}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'wallet'
  }
}
