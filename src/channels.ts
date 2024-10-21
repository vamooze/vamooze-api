import { dispatch } from "./services/dispatch/dispatch";
// For more information about this file see https://dove.feathersjs.com/guides/cli/channels.html
import type { RealTimeConnection, Params } from "@feathersjs/feathers";
import type { AuthenticationResult } from "@feathersjs/authentication";
import "@feathersjs/transport-commons";
import type { Application, HookContext } from "./declarations";
import { logger } from "./logger";
import textConstant from "./helpers/textConstant";
import { requestsPath } from "./services/requests/requests.shared";
import { Roles } from "./interfaces/constants";
import { redisClient } from "./app";

export const channels = (app: Application) => {
  const requests = app.service(requestsPath);

  requests.on("created", async (response, context) => {});

  app.on(textConstant.connection, async (connection: RealTimeConnection) => {
    console.log("====================================");
    console.log(`${connection?.user} connected to socket`);
    console.log("====================================");

    try {
      if (connection.user) {
        const roles = await app.service("roles").get(connection.user.role);

        // for now we only allow instant websocket connection to the server for dispatch riders
        if (roles.slug === Roles.Dispatch) {
          app
            .channel(`dispatch-channel/${connection.user.id}`)
            .join(connection);
        } else {
          app.channel(`userIds/${connection.user.id}`).join(connection);
        }

        console.log("..app.channels...", app.channels, "..app.channels...");
        // The connection is no longer anonymous, remove it
        // app.channel("anonymous").leave(connection);

        // Add it to the authenticated user channel
        // app.channel("authenticated").join(connection);

        // const auths = app.channel(textConstant.authenticated).connections;
        // for (let index = 0; index < auths.length; index++) {
        //   const auth = auths[index];
        //   const roles = await app.service("roles").get(auth.user.role);
        //   app.channel(roles.slug).join(connection);
        //   // app.channel(`userIds/${auth.user._id}`).join(connection);
        // }

        // Make the user with `_id` 5 leave the `admins` channel
        // app.channel('dispatch').leave(connection => {
        //   return connection.user._id === '5f7363e366e56d2a589b3aa1';
        // });
      } else {
        // On a new real-time connection, add it to the anonymous channel
        // app.channel(textConstant.anonymous).join(connection);
      }
    } catch (error) {
      console.log(
        "=============socket connection error======================="
      );
      console.log(error);
      console.log(
        "=============socket connection error======================="
      );
      throw error;
    }
    // On a new real-time connection, add it to the anonymous channel
    // app.channel("anonymous").join(connection);
  });

  app.on(
    textConstant.login,
    (authResult: AuthenticationResult, { connection }: Params) => {
      // connection can be undefined if there is no
      // real-time connection, e.g. when logging in via REST
      if (connection) {
        // The connection is no longer anonymous, remove it
        app.channel(textConstant.anonymous).leave(connection);

        // Add it to the authenticated user channel
        app.channel(textConstant.authenticated).join(connection);
      }
    }
  );

  app
    .service("requests")
    .publish(textConstant.requestAcceptedByDispatch, async (data, context) => {
      const newObjectForRequester = {
        message: "Dispatch found",
        data: {
          //@ts-ignore
          request: data.request,
          //@ts-ignore
          ...data?.dispatchDetails,
           //@ts-ignore
          requestDetails: data?.requestDetails
        },
      };
      //@ts-ignore
      const dispatch_pool = data.dispatch_pool;

      logger.info({
        //@ts-ignore
        message: `************** About to emit to other dispatch and requester for request ${data.request}**************`,
        data: dispatch_pool,
      });

      if (dispatch_pool && dispatch_pool.length) {
        const dispatchPoolUserIds = dispatch_pool;
        //@ts-ignore
        const dispatchWhoAccepted = data?.dispatch_who_accepted_user_id;
        const dispatchesWhoDidNotAccept = dispatchPoolUserIds.filter(
          //@ts-ignore
          (id) => id !== dispatchWhoAccepted
        );

        const dispatchesWhoDidNotAcceptChannels = dispatchesWhoDidNotAccept.map(
          //@ts-ignore
          (id) => `dispatch-channel/${id}`
        );

        logger.info({
          //@ts-ignore
          message: `**************   dispatches who should remove push from their screens  for  request ${data.request}**************`,
          data: dispatchesWhoDidNotAcceptChannels,
        });

        logger.info({
          //@ts-ignore
          message: `**************   informing the requester that dispatch has accepted for  request ${data.request}**************`,

          data: [
            "channel for requester>>>>>>>>>",
            //@ts-ignore
            `userIds/${data?.requester}`,
            ">>>>>>>> app channels",
            app.channels,
          ],
        });

        return [
          //@ts-ignore
          app.channel(`userIds/${data?.requester}`).send(newObjectForRequester),
          app
            .channel(dispatchesWhoDidNotAcceptChannels)
            //@ts-ignore
            .send({ message: "Dispatch Matched", request: data?.request }),
        ];
      } else {
        return [
          //@ts-ignore
          app.channel(`userIds/${data?.requester}`).send(newObjectForRequester),
        ];
      }
    });

  app
    .service("requests")
    .publish(
      textConstant.requestCancelledByRequester,
      async (data, context) => {
        const newObjectForDispatch = {
          //@ts-ignore
          message: data?.message,
          data: {
            //@ts-ignore
            request: data.request,
            //@ts-ignore
            ...data?.dispatchDetails,
          },
        };
        return [
          app //@ts-ignore
            .channel(`dispatch-channel/${data?.requester}`)
            .send(newObjectForDispatch),
        ];
      }
    );

  app
    .service("requests")
    .publish(textConstant.noDispatchAvailable, (data, context) => {
      //@ts-ignore
      const requesterId = data?.data?.requester;
      return [app.channel(`userIds/${requesterId}`)];
    });

  app
    .service("requests")
    .publish(textConstant.deliveryUpdate, (data, context) => {
      const newObjectForRequester = {
        //@ts-ignore
        message: data?.message,
        //@ts-ignore
        data: data.data,
      };
      //@ts-ignore
      const requesterId = data?.requester;
      return [
        app.channel(`userIds/${requesterId}`).send(newObjectForRequester),
      ];
    });

  app
    .service("requests")
    .publish(textConstant.locationUpdateDispatch, (data, context) => {
      return [
        app //@ts-ignore
          .channel(`dispatch-channel/${data?.dispatch_who_accepted_user_id}`)
          .send({
            message: "Update dispatch location",
            //@ts-ignore
            request: data?.request,
          }),
      ];
    });

  app
    .service("requests")
    .publish(textConstant.locationUpdateRequester, (data, context) => {
      //@ts-ignore
      const requesterId = data?.data?.requester;
      return [app.channel(`userIds/${requesterId}`)];
    });

  // eslint-disable-next-line no-unused-vars
  app.publish((data: any, context: HookContext) => {
    // Here you can add event publishers to channels set up in `channels.js`
    // To publish only for a specific event use `app.publish(eventname, () => {})`

    // e.g. to publish all service events to all authenticated users use
    return app.channel(textConstant.authenticated);
  });
};
