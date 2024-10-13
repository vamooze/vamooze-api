// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from "@feathersjs/authentication";

import { hooks as schemaHooks } from "@feathersjs/schema";

import {
  transactionsDataValidator,
  transactionsPatchValidator,
  transactionsQueryValidator,
  transactionsResolver,
  transactionsExternalResolver,
  transactionsDataResolver,
  transactionsPatchResolver,
  transactionsQueryResolver,
} from "./transactions.schema";

import type { Application } from "../../declarations";
import { TransactionsService, getOptions } from "./transactions.class";
import { transactionsPath, transactionsMethods } from "./transactions.shared";
import { successResponse } from "../../helpers/functions";

export * from "./transactions.class";
export * from "./transactions.schema";

// A configure function that registers the service and its hooks via `app.configure`
export const transactions = (app: Application) => {
  const options = getOptions(app);
  app.use(transactionsPath, new TransactionsService(options, app), {
    // A list of all methods this service exposes externally
    methods: transactionsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.service(transactionsPath).hooks({
    before: {
      all: [
        authenticate("jwt"),
        schemaHooks.validateQuery(transactionsQueryValidator),
        schemaHooks.resolveQuery(transactionsQueryResolver),
      ],
      find: [
        async (context) => {
          const user = context.params.user;
          //@ts-ignore
          context.params.query = {
            ...context.params.query,
            //@ts-ignore
            userId: user?.id
          };
          return context;
        },
      ],
      get: [],
      create: [
        schemaHooks.validateData(transactionsDataValidator),
        schemaHooks.resolveData(transactionsDataResolver),
      ],
      patch: [
        schemaHooks.validateData(transactionsPatchValidator),
        schemaHooks.resolveData(transactionsPatchResolver),
      ],
      remove: [],
    },
    after: {
      all: [],
    },
    error: {
      all: [],
    },
  });
};

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    [transactionsPath]: TransactionsService;
  }
}
