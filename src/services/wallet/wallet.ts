// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from "@feathersjs/authentication";
import { HookContext, Params } from "@feathersjs/feathers";
import { hooks as schemaHooks } from "@feathersjs/schema";
import crypto from "crypto";
import { Response, Request } from "express";
import { BadRequest, NotFound } from "@feathersjs/errors";
import { Paginated } from "@feathersjs/feathers";
import axios from "axios";
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
import {
  initializeTransaction,
  sendEmail,
  successResponse,
} from "../../helpers/functions";
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

  app.service(walletPath).hooks({
    before: {
      all: [
        authenticate("jwt"),
        schemaHooks.validateQuery(walletQueryValidator),
        schemaHooks.resolveQuery(walletQueryResolver),
      ],
      find: [
        async (context) => {
          const user = context.params.user;
          //@ts-ignore
          context.params.query = {
            ...context.params.query,
            //@ts-ignore
            user_id: user?.id
          };
          return context;
        },
      ],
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
      find: [
        async (context) => {
          //@ts-ignore
          context.result = successResponse(
            //@ts-ignore
            context.result.data,
            200,
            "Wallet retrieved successfully"
          );
        },
      ],
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

      param.user.email = "payment@vamooze.com";

      if (!param.user.email && !param.user.phone_number) {
        throw new BadRequest(
          "Ensure either an email or phone number is passed"
        );
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

      const response = await initializeTransaction(param.user, data.amount);

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

  //@ts-ignore for mobile use
  app.use("/transactions/initiate", {
    async create(data: any, param: any) {
      if (typeof data.amount !== "number" || data.amount < 2000) {
        throw new BadRequest("Amount must be a number and at least 2000.");
      }

      param.user.email = "payment@vamooze.com";

      if (!param.user.email && !param.user.phone_number) {
        throw new BadRequest(
          "Ensure either an email or phone number is passed"
        );
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

      const transactionService = app.service("transactions");
      const transactionData: Omit<TransactionsData, "id"> = {
        wallet_id: wallet.id,
        type: TransactionType.Deposit,
        amount: data.amount,
        status: TransactionStatus.Pending,
        reference: crypto.randomUUID(),
        metadata: {
          initiatedBy: param.user.id,
          paymentMethod: "Paystack",
        },
      };

      //@ts-ignore
      const transaction = await transactionService.create(transactionData);

      return {
        transaction,
        paymentInfo: {
          amount: data.amount,
          email: param.user.email,
          reference: transaction.reference,
        },
      };
    },
  });

  //@ts-ignore for mobile use
  app.use("/verify-transaction/:reference", {
    async find(params: any) {
      const reference = params.route.reference;
      console.log(reference, "..reference...");
      const knex = app.get("postgresqlClient");
      const transactionService = app.service("transactions");

      try {
        const result = await knex.transaction(async (trx: any) => {
          // Check if the transaction exists
          const transaction = await trx("transactions")
            .where({ reference })
            .first();

          if (!transaction) {
            throw new NotFound("Transaction not found");
          }

          if (transaction.status === TransactionStatus.Completed) {
            return successResponse(
              null,
              200,
              "Transaction has been successful and wallet credited"
            );
          }

          if (transaction.status === TransactionStatus.Pending) {
            // Verify transaction status with Paystack
            const paystackResponse = await axios.get(
              `https://api.paystack.co/transaction/verify/${reference}`,
              {
                headers: {
                  Authorization: `Bearer ${constants.paystack.key}`,
                },
              }
            );

            if (paystackResponse.data.data.status === "success") {
              // Update transaction status
              await transactionService.patch(
                transaction.id,
                { status: TransactionStatus.Completed },
                { transaction: trx }
              );

              await knex("wallet")
                .where({ id: transaction.wallet_id })
                .increment("balance", transaction.amount);

              return {
                message: "Transaction verified and completed successfully",
              };
            } else {
              return { message: "Transaction is still pending on Paystack" };
            }
          }

          return {
            message: "Transaction status is neither pending nor completed",
          };
        });

        return result;
      } catch (error) {
        logger.error("Error processing transaction:", error);
        if (error instanceof NotFound) {
          throw error;
        }
        throw new BadRequest("Error processing transaction");
      }
    },
  });

  const services = ["/initiate-payment", "/transactions/initiate"];
  services.forEach((path) => {
    //@ts-ignore
    app.service(path).hooks({
      before: {
        all: [authenticate("jwt")],
      },
    });
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
          query: { phone_number: phone },
        });

        if (userResult.data.length === 0) {
          logger.warn(`User with phone number: ${phone} not found.`);
          return;
        }

        // Find the existing transaction using the Paystack reference
        const transactionService = app.service("transactions");
        const transactionResult = await transactionService.find({
          query: { reference },
        });

        if (transactionResult.data.length === 0) {
          logger.warn(`Transaction with reference ${reference} not found.`);
          return;
        }

        const transaction = transactionResult.data[0];

        if (transaction.status !== TransactionStatus.Pending) {
          logger.info(
            `Transaction ${reference} has already been processed or expired`
          );
          return;
        }

        const knex = app.get("postgresqlClient");

        try {
          await knex.transaction(async (trx: any) => {
            // Update the transaction status to 'Completed'
            await transactionService.patch(
              transaction.id,
              { status: TransactionStatus.Completed },
              { trx }
            );

            await knex("wallet")
              .where({ id: transaction.wallet_id })
              .increment("balance", amount / 100);
          });

          logger.info(
            `User ${customer.email} wallet funded with ₦${amount / 100}`
          );
        } catch (error) {
          logger.error(`Error processing transaction ${reference}:`, error);
          throw new Error("Transaction failed. Rolling back.");
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

  //@ts-ignore
  app.use("/verify-bank-account", {
    async create(data: any, params: any) {
      const { account_number, bank_code } = data;

      // Validate input
      if (!account_number || !bank_code) {
        throw new BadRequest("Account number and bank code are required");
      }

      // Build the Paystack API URL
      const url = `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`;

      try {
        // Make a GET request to Paystack API using axios
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${constants.paystack.key}`,
          },
        });

        // Handle successful response
        if (response.data.status === true) {
          return response.data;
        } else {
          throw new BadRequest(
            "Account verification failed: " + response.data.message
          );
        }
      } catch (error) {
        throw new BadRequest("Account verification failed"); // Generic error message for the user
      }
    },
  });
};

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    [walletPath]: WalletService;
  }
}
