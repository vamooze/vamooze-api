// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from "@feathersjs/authentication";

import { hooks as schemaHooks } from "@feathersjs/schema";

import {
  assetsDataValidator,
  assetsPatchValidator,
  assetsQueryValidator,
  assetsResolver,
  assetsExternalResolver,
  assetsDataResolver,
  assetsPatchResolver,
  assetsQueryResolver,
} from "./assets.schema";

import { Application, HookContext } from "../../declarations";
import { AssetsService, getOptions } from "./assets.class";
import { assetsPath, assetsMethods } from "./assets.shared";
import { createValidator } from "express-joi-validation";
import Joi from "joi";
import { Conflict, NotFound } from "@feathersjs/errors";
import { Roles } from "../../interfaces/constants";
import { getOtp } from "../../helpers/functions";
import { logger } from "../../logger";

export * from "./assets.class";
export * from "./assets.schema";

const validator = createValidator({ passError: true, statusCode: 400 });
const schemas = {
  signup: Joi.object().keys({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    phone_number: Joi.string().optional().max(12),
    state: Joi.string().optional(),
    address: Joi.string().optional(),
    local_government_area: Joi.string().optional(),
  }),
};

// A configure function that registers the service and its hooks via `app.configure`
export const assets = (app: Application) => {
  // Register our service on the Feathers application
  app.use(assetsPath, new AssetsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: assetsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });

  app.post(
    "/asset-owners/signup",
    validator.body(schemas.signup),
    async (req: any, res: any, next: any) => {
      try {
        const user = await app
          .service("users")
          .find({ query: { email: req.body.email } });

        if (user?.data?.length > 0) {
          throw new Conflict("User with this email already exists");
        }
        const role = await app
          .service("roles")
          .find({ query: { $limit: 1, slug: Roles.AssetOwner } });
        if (role?.data?.length === 0) {
          throw new NotFound("Role not found");
        }
        req.body.role = role?.data[0]?.id;
        req.body.otp = getOtp();
        const result = await app.service("users").create(req.body);
        res.json(result);
      } catch (error: any) {
        logger.error({
          message: error.message,
          stack: error.stack,
          email: req.body.email,
        });
        next(error);
      }
    }
  );
  // Initialize hooks
  app.service(assetsPath).hooks({
    around: {
      all: [
        authenticate("jwt"),
        schemaHooks.resolveExternal(assetsExternalResolver),
        schemaHooks.resolveResult(assetsResolver),
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(assetsQueryValidator),
        schemaHooks.resolveQuery(assetsQueryResolver),
      ],

      find: async (context) => {
        const user = context.params.user; // Get authenticated user from context

        if (!user) return;

        context.params.query = {
          user: user.id,
        };

        return context;
      },

      get: [],
      create: [
        schemaHooks.validateData(assetsDataValidator),
        schemaHooks.resolveData(assetsDataResolver),
        async (context: HookContext) => {
          context.data = {
            ...context.data,
            asset_image: JSON.stringify(context.data.asset_image),
          };
        },
      ],
      patch: [
        schemaHooks.validateData(assetsPatchValidator),
        schemaHooks.resolveData(assetsPatchResolver),
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
    [assetsPath]: AssetsService;
  }
}
