// // For more information about this file see https://dove.feathersjs.com/guides/cli/channels.html
// import type { RealTimeConnection, Params } from "@feathersjs/feathers";
// import type { AuthenticationResult } from "@feathersjs/authentication";
// import "@feathersjs/transport-commons";
// import type { Application, HookContext } from "./declarations";
// import { logger } from "./logger";

// export const channels = (app: Application) => {
//   logger.info(
//     "Setting up channels. See `channels.ts` and https://dove.feathersjs.com/api/channels.html for more information."
//   );

//   const joinChannels = async (user: any, connection: RealTimeConnection) => {
//     // Add to authenticated channel
//     app.channel('authenticated').join(connection);

//     // Add to role-specific channel
//     const roles = await app.service('roles').get(user.role);
//     app.channel(roles.slug).join(connection);

//     // Add to user-specific channel
//     // app.channel(`userIds/${user._id}`).join(connection);

//     // // If user has rooms, join room-specific channels
//     // if (user.rooms) {
//     //   user.rooms.forEach((room: string) => {
//     //     app.channel(`rooms/${room}`).join(connection);
//     //   });
//     // }
//   };

//   const leaveChannels = (user: any) => {
//     app.channel(app.channels).leave((connection : RealTimeConnection) => connection.user._id === user._id);
//   };

//   app.on('connection', async (connection: RealTimeConnection) => {
//     logger.info(`New connection: ${connection}`);
    
//     app.channel('anonymous').join(connection);

//     if (connection.user) {
//       app.channel('anonymous').leave(connection);
//       await joinChannels(connection.user, connection);
//     }
//   });

//   app.on('login', async (authResult: AuthenticationResult, { connection }: Params) => {
//     if (connection) {
//       app.channel('anonymous').leave(connection);
//       await joinChannels(connection.user, connection);
//     }
//   });

//   app.on('logout', (authResult: AuthenticationResult, { connection }: Params) => {
//     if (connection) {
//       leaveChannels(connection.user);
//       app.channel('anonymous').join(connection);
//     }
//   });

//   // app.service('users').on('updated', async (user: any) => {
//   //   leaveChannels(user);
//   //   const connections = app.channel(app.channels).filter((connection) => connection.user._id === user._id);
//   //   connections.forEach((connection : RealTimeConnection) => joinChannels(user, connection));
//   // });

//   app.service('users').on('removed', (user: any) => {
//     leaveChannels(user);
//   });

//   app.service('requests').publish('new-delivery-requests', (data, context) => {
//     logger.info('Publishing new-delivery-requests event');
//     return [
//       app.channel('dispatch'),
//       app.channel('authenticated')
//     ];
//   });

//   app.service('requests').publish('no-dispatch-available', (data, context) => {
//     logger.info('Publishing no-dispatch-available event');
//     return [
//       app.channel('authenticated').filter((connection) => {
//         // Only send to admin users or the user who made the request
//         return connection.user.isAdmin || connection.user._id === context.params.user._id;
//       })
//     ];
//   });

//   // Default publish function
//   app.publish((data: any, context: HookContext) => {
//     logger.debug(`Publishing ${context.path} ${context.method}`, data);
    
//     // Publish all events to authenticated users by default
//     return app.channel('authenticated');
//   });
// };
