import { Queue, Worker, QueueEvents, } from 'bullmq'

export const newDispatchRequest = 'new-dispatch-request'

export const generateJobName = (userid: number) => {
  return `${newDispatchRequest}/${userid}}`
}

export const connectionObject  = { connection: {
  host: "127.0.0.1",
  port: 6379,
}}

export const dispatchRequestQueue = new Queue(newDispatchRequest, connectionObject);



//logistics-redis.redis.cache.windows.net:6380,password=C5dESXwCwOpLD7wmaMRqRhETSRXrDN7uEAzCaOiRiAo=,ssl=True,abortConnect=False
// queue.add("cars", { color: "blue" });



// const queueEvents = new QueueEvents(paint);

// queueEvents.on("completed", ({ jobId }) => {
//   console.log("done painting");
// });

// queueEvents.on(
//   'failed',
//   ({ jobId, failedReason }: { jobId: string; failedReason: string }) => {
//     console.error('error painting', failedReason);
//   },
// );
