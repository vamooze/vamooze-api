// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from "@feathersjs/authentication";
import { HookContext, Params } from "@feathersjs/feathers";
import { hooks as schemaHooks } from "@feathersjs/schema";
import crypto from "crypto";
import { Response, Request } from "express";
import { BadRequest } from "@feathersjs/errors";

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
import { initializeTransaction } from "../../helpers/functions";

import type { Application } from "../../declarations";
import { WalletService, getOptions } from "./wallet.class";
import { walletPath, walletMethods } from "./wallet.shared";

export * from "./wallet.class";
export * from "./wallet.schema";

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

      param.user.email = "balogunbiola101@gmail.com";
      if (!param.user.email) {
        throw new BadRequest("Invalid Email");
      }

      const response = await initializeTransaction(
        param.user.email,
        data.amount
      );
      // const walletService = app.service("wallet");
      // return await walletService.fundWallet(params);

      return response;
    },
  });

  //@ts-ignore
  app.service("/initiate-payment").hooks({
    before: {
      all: [authenticate("jwt")], // Custom hooks
    },
  });

  app.post("/webhook/paystack", async (req: Request, res: Response) => {
    const secret = constants.paystack.key;

    if (!secret) {
      throw new Error("SECRET_KEY is not defined in environment variables");
    }

    const allowedIps = ["52.31.139.75", "52.49.173.169", "52.214.14.220"];
    try {
      // Check if request IP is allowed (optional for extra security)
      const requestIp =
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress;
      //@ts-ignore
      if (!allowedIps.includes(requestIp)) {
        return res.status(403).send("Forbidden");
      }

      // Validate the signature
      const hash = crypto
        .createHmac("sha512", secret)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (hash !== req.headers["x-paystack-signature"]) {
        return res.status(401).send("Unauthorized");
      }

      // Retrieve event from Paystack
      const event = req.body;

      // Acknowledge receipt of webhook (send 200 OK immediately)
      res.status(200).send("OK");

      // Process the event asynchronously after sending 200 OK
      // await processPaystackEvent(app, event);
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
