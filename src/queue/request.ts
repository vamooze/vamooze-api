import { Queue, Worker, QueueEvents } from "bullmq";
import { queueOptions } from "./config";
import { logger } from "../logger";
import { app, redisClient } from "../app";
import { Termii } from "../helpers/termii";
import { DispatchApprovalStatus } from "../interfaces/constants";

import textConstant from "../helpers/textConstant";
const moment = require("moment");
import { sendPush } from "../helpers/functions";

const DISPATCH_REQUEST_QUEUE = "dispatch-request-queue";
const LOCATION_UPDATE_QUEUE = "location-update-queue";
const SCHEDULED_DELIVERY_QUEUE = "scheduled-delivery-queue";

export const dispatchRequestQueue = new Queue(
  DISPATCH_REQUEST_QUEUE,
  queueOptions
);

export const scheduledDeliveryQueue = new Queue(
  SCHEDULED_DELIVERY_QUEUE,
  queueOptions
);

export const locationUpdateQueue = new Queue(
  LOCATION_UPDATE_QUEUE,
  queueOptions
);

// Helper function to add a job to the queue
export const addDispatchRequestJob = async (data: any) => {
  const job = await dispatchRequestQueue.add(
    `new-dispatch-request-${data.id}`,
    data,
    {
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
  logger.info(`Added job ${job.id} to queue ${DISPATCH_REQUEST_QUEUE}`);
  return job;
};

export const addScheduledDeliveryJob = async (data: any) => {
  const delay = new Date(data.scheduled_time).getTime() - Date.now();
  const job = await scheduledDeliveryQueue.add(
    `scheduled-delivery-${data.id}`,
    data,
    {
      delay,
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
  return job;
};

export const addLocationUpdateJob = async (data: {
  request: number;
  dispatch_who_accepted_user_id: number;
  frequency: number;
}) => {
  const job = await locationUpdateQueue.add(
    `location-update-${data.request}`,
    data,
    {
      repeat: {
        every: data.frequency,
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
  return job;
};

export const dispatchRequestWorker = new Worker(
  DISPATCH_REQUEST_QUEUE,
  async (job) => {
    const knex = app.get("postgresqlClient");
    const suitableRidersData = await knex("dispatch")
      .join("users", "dispatch.user_id", "users.id")
      .select(
        "users.phone_number",
        "users.first_name",
        "users.last_name",
        "users.one_signal_player_id",
        "users.one_signal_alias",
        "dispatch.address",
        "dispatch.city",
        "dispatch.state",
        "dispatch.lga",
        "dispatch.country",
        "dispatch.available_days",
        "dispatch.available_time_frames",
        "dispatch.id",
        "dispatch.onTrip",
        "dispatch.isAcceptingPickUps",
        "dispatch.user_id"
      )
      .where({
        isAcceptingPickUps: true, // Add necessary conditions here
        // onTrip: false,
        approval_status: DispatchApprovalStatus.Approved,
      })
      .orderBy("id", "asc")
      .limit(50);

    if (!suitableRidersData || !suitableRidersData.length) {
      app.service("requests").emit(textConstant.noDispatchAvailable, {
        message: textConstant.english.noDispatchAvailableMessage,
        data: job.data,
      });
      if (job?.id) return await dispatchRequestQueue.remove(job?.id);
      return;
    }

    logger.info({
      message: `Found ${suitableRidersData.length} suitable riders for request ${job.data.id}`,
      riders: suitableRidersData.map((rider) => rider.user_id),
    });

    //**********send sms */
    const termii = new Termii();

    for (const rider of suitableRidersData) {
      const smsMessageDetails = {
        name: rider.first_name,
        pickup_address: job.data.pickup_address,
        delivery_address: job.data.delivery_address,
        hour_time: moment(job.data.createdAt).format("h:mm:ss a"),
        month_time: moment(job.data.createdAt).format("MMMM Do YYYY"),
      };

      const messageToRider =
        textConstant.english.messageToRiders(smsMessageDetails);

      // await termii.sendSMS(rider.phone_number, messageToRider);
    }

    //**********send sms */

    const dispatchPoolUserIds = suitableRidersData.map(
      (eachRider) => eachRider?.user_id
    );

    redisClient.set(
      `${textConstant.requests}-dispatch-pool-${job.data.id}`,
      JSON.stringify(dispatchPoolUserIds)
    );

    // Unhandled Rejection ClientClosedError: The client is closed
    //   at Commander._RedisClient_sendCommand 

    await knex("requests")
      .where({ id: job.data.id })
      .update({
        dispatch_pool: JSON.stringify(dispatchPoolUserIds),
      });

    //**********send onse signal */
    const suitableRidersOneSingalAlias = suitableRidersData
      //@ts-ignore
      .map((eachRider) => eachRider?.one_signal_alias)
      .filter((id) => id !== null && id !== undefined);

    const dataForPushNotification = {
      timeToUser: 10,
      amountFrom: 0,
      amountTo: job.data.delivery_price_details.totalPrice,
      pickUpAddress: job.data.pickup_address,
      dropOffAddress: job.data.delivery_address,
      currency: "N",
      paymentType: "Cash",
      ...job.data,
    };

    await sendPush(
      textConstant.dispatchRequest,
      textConstant.english.new_dispatch_push_notification_heading,
      suitableRidersOneSingalAlias,
      dataForPushNotification
    );
  },
  queueOptions
);

export const scheduledDeliveryWorker = new Worker(
  SCHEDULED_DELIVERY_QUEUE,
  async (job) => {
    // When it's time to process the scheduled delivery, add it to the dispatch request queue
    await addDispatchRequestJob(job.data);
  },
  queueOptions
);

export const locationUpdateWorker = new Worker(
  LOCATION_UPDATE_QUEUE,
  async (job) => {
    const { request, dispatch_who_accepted_user_id } = job.data;
    app.service("requests").emit(textConstant.locationUpdateDispatch, {
      request,
      dispatch_who_accepted_user_id,
    });
  },
  queueOptions
);
