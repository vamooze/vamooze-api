// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from "@feathersjs/authentication";
import { HookContext, Params } from "@feathersjs/feathers";
import { hooks as schemaHooks } from "@feathersjs/schema";
import crypto from "crypto";
import { Response, Request } from "express";
import { BadRequest } from "@feathersjs/errors";
import { Paginated } from "@feathersjs/feathers";
import {
  walletDataValidator,
  walletPatchValidator,
  walletQueryValidator,
  walletResolver,
  walletExternalResolver,
  walletDataResolver,
  walletPatchResolver,
  walletQueryResolver,
} from "./wallet.schema";
import { constants } from "../../helpers/constants";
import { initializeTransaction, sendEmail } from "../../helpers/functions";
import { TransactionStatus, TransactionType } from "../../interfaces/constants";
import { logger } from "../../logger";
import type { Application } from "../../declarations";
import { WalletService, getOptions } from "./wallet.class";
import { walletPath, walletMethods } from "./wallet.shared";
import { TransactionsData } from "../transactions/transactions.schema";

export * from "./wallet.class";
export * from "./wallet.schema";
import { Wallet } from "./wallet.schema";

// A configure function that registers the service and its hooks via `app.configure`
export const wallet = (app: Application) => {
  const options = getOptions(app);
  // Register our service on the Feathers application
  app.use(walletPath, new WalletService(options, app), {
    // A list of all methods this service exposes externally
    methods: walletMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.service(walletPath).hooks({
    // around: {
    //   all: [
    //     authenticate('jwt'),
    //     schemaHooks.resolveExternal(walletExternalResolver),
    //     schemaHooks.resolveResult(walletResolver)
    //   ]
    // },
    before: {
      all: [
        authenticate("jwt"),
        schemaHooks.validateQuery(walletQueryValidator),
        schemaHooks.resolveQuery(walletQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(walletDataValidator),
        schemaHooks.resolveData(walletDataResolver),
      ],
      patch: [
        schemaHooks.validateData(walletPatchValidator),
        schemaHooks.resolveData(walletPatchResolver),
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

  //@ts-ignore
  app.use("/initiate-payment", {
    async create(data: any, param: any) {
      if (typeof data.amount !== "number" || data.amount < 2000) {
        throw new BadRequest("Amount must be a number and at least 2000.");
      }

      param.user.email = 'payment@vamooze.com'

      if (!param.user.email && !param.user.phone_number) {
        throw new BadRequest("Ensure either an email or phone number is passed");
      }

      const walletService = app.service("wallet");
      let walletResult = (await walletService.find({
        query: { user_id: param.user.id },
      })) as Paginated<Wallet>;

      let wallet: Wallet | null = null;

      if (walletResult.data.length === 0) {
        // If no wallet exists, create a new one
        wallet = await walletService.create({
          user_id: param.user.id,
          balance: 0.0, // New wallet starts with a balance of 0
        });
      } else {
        // Use the existing wallet
        wallet = walletResult.data[0];
      }

      const response = await initializeTransaction(
        param.user,
        data.amount
      );

      // Use the reference from Paystack's response
      const { reference, access_code } = response.data;

      const transactionService = app.service("transactions");
      const transactionData: Omit<TransactionsData, "id"> = {
        wallet_id: wallet.id,
        type: TransactionType.Deposit,
        amount: data.amount,
        status: TransactionStatus.Pending,
        reference: reference,
        metadata: {
          initiatedBy: param.user.id,
          paymentMethod: "Paystack",
          access_code,
        },
      };

      //@ts-ignore
      const transaction = await transactionService.create(transactionData);

      return { transaction, paymentResponse: response };
    },
  });

  //@ts-ignore
  app.service("/initiate-payment").hooks({
    before: {
      all: [authenticate("jwt")], // Custom hooks
    },
  });

  async function processPaystackEvent(app: any, event: any) {
    // Extract necessary data from the Paystack event
    const { event: eventType, data } = event;

    logger.info({
      message: `${eventType}`,
      data,
    });
   
    // Handle successful payment event
    if (eventType === "charge.success") {
      const { amount, customer, reference, status, phone } = data;

      // Ensure payment status is successful
      if (status === "success") {
        // Find the user by email
        const userService = app.service("users");
        const userResult = await userService.find({
          query: { phone_number: phone  },
        });

        if (userResult.data.length > 0) {
          const userId = userResult.data[0].id;

          // Find the existing transaction using the Paystack reference
          const transactionService = app.service("transactions");
          const transactionResult = await transactionService.find({
            query: { reference },
          });

          if (transactionResult.data.length > 0) {
            const transaction = transactionResult.data[0];

            // Ensure the transaction is still pending before updating
            if (transaction.status === TransactionStatus.Pending) {
              const knex = app.get("postgresqlClient");

              try {
             
                await knex.transaction(async (trx: any) => {
                  // Update the transaction status to 'Completed'
                  await transactionService.patch(
                    transaction.id,
                    { status: TransactionStatus.Completed },
                    { trx }
                  );

                  // Update the user's wallet balance (assuming amount is in kobo)
                  const walletService = app.service("wallet");
                  await walletService.patch(
                    transaction.wallet_id,
                    { $inc: { balance: amount / 100 } }, // Convert kobo to Naira
                    { trx }
                  );
                });

                console.log(
                  `User ${customer.email} wallet funded with ₦${amount / 100}`
                );
              } catch (error) {
                console.error(
                  `Error processing transaction ${reference}: `,
                  error
                );
                throw new Error("Transaction failed. Rolling back.");
              }
            } else {
              console.log(
                `Transaction ${reference} has already been processed.`
              );
            }
          } else {
            console.log(`Transaction with reference ${reference} not found.`);
          }
        } else {
          console.log(`User with email ${customer.email} not found.`);
        }
      }
    }
  }

  app.post("/webhook/paystack", async (req: Request, res: Response) => {
    logger.info({
      message: `Paystack web hook called`,
      data: req.body,
    });

    const secret = constants.paystack.key;

    if (!secret) {
      throw new Error("SECRET_KEY is not defined in environment variables");
    }


    try {
  
      // Validate the signature
      const hash = crypto
        .createHmac("sha512", secret)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (hash !== req.headers["x-paystack-signature"]) {
        return res.status(401).send("Unauthorized");
      }

      res.status(200).send("OK");

      await processPaystackEvent(app, req.body);
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).send("Internal Server Error");
    }
  });
};

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    [walletPath]: WalletService;
  }
}
