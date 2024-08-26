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

