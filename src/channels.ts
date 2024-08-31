// For more information about this file see https://dove.feathersjs.com/guides/cli/channels.html
import type { RealTimeConnection, Params } from "@feathersjs/feathers";
import type { AuthenticationResult } from "@feathersjs/authentication";
import "@feathersjs/transport-commons";
import type { Application, HookContext } from "./declarations";
import { logger } from "./logger";

export const channels = (app: Application) => {
  logger.warn(
    "Publishing all events to all authenticated users. See `channels.ts` and https://dove.feathersjs.com/api/channels.html for more information."
  );

  const requests = app.service("requests");

  requests.on("created", async (response, context) => {});

  app.on("connection", async (connection: RealTimeConnection) => {
    console.log("====================================");
    console.log(`${connection?.user} connected to socket`);
    console.log("====================================");

    try {
      if (connection.user) {
        // The connection is no longer anonymous, remove it
        app.channel("anonymous").leave(connection);

        // Add it to the authenticated user channel
        app.channel("authenticated").join(connection);

        const auths = app.channel("authenticated").connections;

        for (let index = 0; index < auths.length; index++) {
          const auth = auths[index];
          const roles = await app.service("roles").get(auth.user.role);
          app.channel(roles.slug).join(connection);
          // app.channel(`userIds/${auth.user._id}`).join(connection);
        }

        console.log("..", auths, app.channels);
        // Make the user with `_id` 5 leave the `admins` channel
        // app.channel('dispatch').leave(connection => {
        //   return connection.user._id === '5f7363e366e56d2a589b3aa1';
        // });
      } else {
        // On a new real-time connection, add it to the anonymous channel
        app.channel("anonymous").join(connection);
      }
    } catch (error) {
      console.log("====================================");
      console.log(error);
      console.log("====================================");
      throw error;
    }
    // On a new real-time connection, add it to the anonymous channel
    app.channel("anonymous").join(connection);
  });

  app.on(
    "login",
    (authResult: AuthenticationResult, { connection }: Params) => {
      // connection can be undefined if there is no
      // real-time connection, e.g. when logging in via REST
      if (connection) {
        // The connection is no longer anonymous, remove it
        app.channel("anonymous").leave(connection);

        // Add it to the authenticated user channel
        app.channel("authenticated").join(connection);
      }
    }
  );

  app.service("requests").publish("new-delivery-requests", (data, context) => {
    // console.log(data, 'new-delivery-requests', app.channel('dispatch').connections, '<><><><><><><>')
    // console.log("Publishing event to all dispatch riders");
    console.log(
    //   "*******",
      app.channel(app.channels).connections,
    //   "****%%%%%***",
    //   app.channel("anonymous").connections
    );

    return [
      app.channel("anonymous"),
      app.channel("authenticated"),
      // app.channel(app.channels).filter((connection) => connection.user._id === context.params.user._id)
    ];
  });

  app.service("requests").publish("no-dispatch-available", (data, context) => {
    // console.log(data, 'new-delivery-requests', app.channel('dispatch').connections, '<><><><><><><>')
    console.log("No dispatch riders", app.channel(app.channels).connections,);

  
    return [
      app.channel('authenticated'),
      app.channel('anonymous'),
      // app.channel('authenticated')
      // app.channel(app.channels).filter((connection) => connection.user._id === context.params.user._id)
    ];
  });

  // eslint-disable-next-line no-unused-vars
  app.publish((data: any, context: HookContext) => {
    // Here you can add event publishers to channels set up in `channels.js`
    // To publish only for a specific event use `app.publish(eventname, () => {})`

    // e.g. to publish all service events to all authenticated users use
    return app.channel("authenticated");
  });
};
