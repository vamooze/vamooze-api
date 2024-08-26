import { Queue, Worker, QueueEvents, ConnectionOptions, QueueOptions } from 'bullmq'
import { constants } from "../helpers/constants";






export const newDispatchRequest = 'new-dispatch-request'

export const generateJobName = (userid: number) => {
  return `${newDispatchRequest}/${userid}}`
}


export const connectionObject: QueueOptions = {
  connection: {
    host: constants.redisConfig.host,
    port: parseInt(constants.redisConfig.port, 10),
    password: constants.redisConfig.password,
    tls: constants.redisConfig.ssl ? {} : undefined
  } as ConnectionOptions
};

export const dispatchRequestQueue = new Queue(newDispatchRequest, connectionObject);


// redisConfig: {
//   password: process.env.REDIS_PASSWORD,
//   host: process.env.REDIS_HOST || '127.0.0.1',
//   port: process.env.REDIS_PORT || '6379',
//   ssl : true,
// }