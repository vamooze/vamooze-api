import { ConnectionOptions, QueueOptions } from 'bullmq'
import { constants } from "../helpers/constants";

// Connection options
const connectionOptions: ConnectionOptions = {
  host: constants.redisConfig.host,
  port: parseInt(constants.redisConfig.port, 10),
  password: constants.redisConfig.password,
  tls: constants.redisConfig.ssl ? {} : undefined
};

// Queue options
export const queueOptions: QueueOptions = {
  connection: connectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
};

