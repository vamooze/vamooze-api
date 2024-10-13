// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from "@feathersjs/feathers";
import { KnexService } from "@feathersjs/knex";
import type { KnexAdapterParams, KnexAdapterOptions } from "@feathersjs/knex";
import { NotFound, BadRequest } from "@feathersjs/errors";

import { successResponseWithPagination } from "../../helpers/functions";

import type { Application } from "../../declarations";
import type {
  Transactions,
  TransactionsData,
  TransactionsPatch,
  TransactionsQuery,
} from "./transactions.schema";

export type {
  Transactions,
  TransactionsData,
  TransactionsPatch,
  TransactionsQuery,
};

export interface TransactionsParams
  extends KnexAdapterParams<TransactionsQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class TransactionsService<
  ServiceParams extends Params = TransactionsParams,
> extends KnexService<
  Transactions,
  TransactionsData,
  TransactionsParams,
  TransactionsPatch
> {
  constructor(options: KnexAdapterOptions, app: Application) {
    super(options);
    //@ts-ignore
    this.app = app;
  }

  /**
   * Find transactions for a user with optional filtering and pagination.
   * @param {ServiceParams} params - The params object containing query parameters.
   * @returns {Promise<{ total: number; limit: number; skip: number; data: Transactions[] }>}
   */

  //@ts-ignore
  async find(params: ServiceParams) {
    const userId = params?.query?.userId;

    if (!userId) {
      throw new BadRequest("userId is required");
    }

    //@ts-ignore
    const knex = this.app.get("postgresqlClient");

    const { $limit = 10, $skip = 0, status, $sort = {} } = params.query || {};

    let baseQuery = knex("transactions")
      .join("wallet", "transactions.wallet_id", "wallet.id")
      .where("wallet.user_id", userId)
      .select("transactions.*");

    if (status) {
      baseQuery = baseQuery.where("transactions.status", status);
    }

    // Sort by created_at in descending order by default
    const sortField = Object.keys($sort)[0] || "transactions.created_at";
    const sortOrder = $sort[sortField] === -1 ? "desc" : "asc";
    baseQuery = baseQuery.orderBy(sortField, sortOrder);

    const [{ total }] = await knex("transactions")
      .join("wallet", "transactions.wallet_id", "wallet.id")
      .where("wallet.user_id", userId)
      .count("* as total");
    const data = await baseQuery.limit(Number($limit)).offset(Number($skip));

    const result = {
      total: total.total,
      limit: $limit,
      skip: $skip,
      data,
    };
    return successResponseWithPagination(
      result,
      200,
      "Transactions retrieved successfully"
    );
  }
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get("paginate"),
    Model: app.get("postgresqlClient"),
    name: "transactions",
  };
};
