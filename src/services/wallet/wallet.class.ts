// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from "@feathersjs/feathers";
import { KnexService } from "@feathersjs/knex";
import type { KnexAdapterParams, KnexAdapterOptions } from "@feathersjs/knex";
import {
  successResponse,
} from "../../helpers/functions";
import crypto from "crypto";
import type { Application } from "../../declarations";
import type {
  Wallet,
  WalletData,
  WalletPatch,
  WalletQuery,
} from "./wallet.schema";
import { BadRequest,  } from "@feathersjs/errors";

export type { Wallet, WalletData, WalletPatch, WalletQuery };

export interface WalletParams extends KnexAdapterParams<WalletQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class WalletService<
  ServiceParams extends Params = WalletParams,
> extends KnexService<Wallet, WalletData, WalletParams, WalletPatch> {
  constructor(options: KnexAdapterOptions, app: Application) {
    super(options);
    //@ts-ignore
    this.app = app;
  }

  async initializeTransaction(userId: number, amount: number) {
    const parsedAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    if (isNaN(parsedAmount) || parsedAmount < 2000) {
      throw new BadRequest("Amount must be a valid number and at least 2000.");
    }

    //@ts-ignore
    const knex = this.app.get("postgresqlClient");

    return knex.transaction(async (trx: any) => {
      let wallet;
      try {
        // Try to find existing wallet
        wallet = await knex("wallet").where({ user_id: userId }).first();

        if (!wallet) {
          // If no wallet exists, create a new one
          [wallet] = await knex("wallet")
            .insert({ user_id: userId, balance: 0 })
            .returning("*");
        }
      } catch (error: any) {
        throw new BadRequest(
          `Failed to retrieve or create wallet: ${error.message}`
        );
      }

      // Create a pending transaction
      const [transaction] = await trx("transactions").insert({
        wallet_id: wallet.id,
        type: "deposit",
        amount,
        status: "pending",
        reference: crypto.randomUUID(),
        metadata: {
          initiatedBy: userId,
          paymentMethod: "Paystack",
        },
      }).returning("*");

      const data = {
        transaction,
        paymentInfo: {
          amount: amount,
          email: "payment@vamooze.com",
          reference: transaction.reference,
        },
      };
      return successResponse(data, 200, 'Successfully initated transaction') 
    });
  }
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get("paginate"),
    Model: app.get("postgresqlClient"),
    name: "wallet",
  };
};
