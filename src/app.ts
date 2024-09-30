// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers } from "@feathersjs/feathers";
import express, {
  rest,
  json,
  urlencoded,
  cors,
  serveStatic,
  notFound,
  errorHandler,
} from "@feathersjs/express";
import "dotenv/config";
import configuration from "@feathersjs/configuration";
import socketio from "@feathersjs/socketio";
import { constants } from "./helpers/constants";

import type { Application } from "./declarations";
import { configurationValidator } from "./configuration";
import { logger } from "./logger";
import { logError } from "./hooks/log-error";
import { postgresql } from "./postgresql";
import { authentication } from "./authentication";
import { services } from "./services";
import { channels } from "./channels";
import fileUpload from "express-fileupload";
import { createClient } from "redis";

const redisClient = createClient({
  password: constants.redisConfig.password,
  socket: {
    host: constants.redisConfig.host,
    port: parseInt(constants.redisConfig.port, 10),
    //@ts-ignore
    tls: constants.redisConfig.ssl ? {} : undefined,
    reconnectStrategy(retries) {
      if (retries > 10) {
        // Stop trying after 10 retries
        return new Error("Retry attempts exceeded");
      }
      // Retry after a delay
      return Math.min(retries * 50, 2000);
    },
  },
});

redisClient.on("error", (err) => {
  console.log("Redis Connection Error......", err, "......Redis Connection Error")
  logger.error(err)
});

redisClient
  .connect()
  .then((data) => console.log("successfully connected to redis"))
  .catch((err) => console.log("Redis Connection Error2......", err, "......Redis Connection Error2"))

const app: Application = express(feathers());

const testRedis = async () => {
  await redisClient.flushAll()
};

testRedis()

// Load app configuration
app.configure(configuration(configurationValidator));
app.use(fileUpload({ limits: { fileSize: 100 * 1024 * 1024 } }));
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
// Host the public folder
app.use("/", serveStatic(app.get("public")));

// Configure services and real-time functionality
app.configure(rest());
app.configure(
  socketio({
    cors: {
      origin: "*", //app.get('origins') *
    },
  })
);
app.configure(postgresql);
app.configure(authentication);
app.configure(services);
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(notFound());
app.use((err: any, req: any, res: any, next: any) => {
  if (err?.error?.isJoi) {
    // we had a joi error, let's return a custom 400 json response
    // @ts-ignore
    const errorMessage = Object.values(err?.error)[1][0].message;
    res.status(400).json({
      type: err.type, // will be "query" here, but could be "headers", "body", or "params"
      //  err.error.toString()
      message: errorMessage.replace(/[^a-zA-Z0-9]/g, " "),
    });
  } else {
    // pass on to another error handler
    next(err);
  }
});
app.use(errorHandler({ logger }));

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [logError],
  },
  before: {},
  after: {},
  error: {},
});
// Register application setup and teardown hooks here
app.hooks({
  setup: [],
  teardown: [],
});

export { app, redisClient };
