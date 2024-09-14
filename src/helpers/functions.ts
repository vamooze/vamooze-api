import { dispatch } from "./../services/dispatch/dispatch";
import { constants } from "./constants";
import axios from "axios";
import OneSignal from "onesignal-node";
import type { HookContext } from "../declarations";
import {
  EmailDTO,
  PushDataDTO,
  NotificationBase,
  PushType,
} from "../interfaces/constants";
import { logger } from "../logger";
import textConstant from "./textConstant";

import { GeneralError, Forbidden } from "@feathersjs/errors";
export const formatPhoneNumber = (phoneNumber: string | undefined) => {
  if (phoneNumber) {
    if (phoneNumber.substring(0, 1) === "0") {
      return "234" + phoneNumber.substring(phoneNumber.length - 10);
    } else if (phoneNumber.substring(0, 4) === "234") {
      return phoneNumber;
    } else if (phoneNumber.substring(0, 3) === "234") {
      return phoneNumber;
    } else {
      return phoneNumber;
    }
  } else {
    return null;
  }
};

const {
  EmailClient,
  KnownEmailSendStatus,
} = require("@azure/communication-email");

export async function sendEmail(config: EmailDTO) {
  const { toEmail, subject, templateData, receiptName } = config;
  const connectionString = constants.azureEmailConfig.connectionString;

  const emailClient = new EmailClient(connectionString);

  const POLLER_WAIT_TIME = 10;
  try {
    const message = {
      senderAddress: constants.azureEmailConfig.senderAddress,
      content: {
        subject,
        html: templateData,
      },
      recipients: {
        to: [
          {
            address: toEmail,
            displayName: receiptName,
          },
        ],
      },
    };

    const poller = await emailClient.beginSend(message);

    if (!poller.getOperationState().isStarted) {
      logger.error("Email poller was not started.");
    }

    let timeElapsed = 0;
    while (!poller.isDone()) {
      poller.poll();

      await new Promise((resolve) =>
        setTimeout(resolve, POLLER_WAIT_TIME * 1000)
      );
      timeElapsed += 10;

      if (timeElapsed > 18 * POLLER_WAIT_TIME) {
        logger.error("Email Polling timed out.");
      }
    }

    if (poller.getResult().status === KnownEmailSendStatus.Succeeded) {
      logger.info(
        `Successfully sent the email (operation id: ${poller.getResult().id})`
      );
    } else {
      throw poller.getResult().error;
    }
  } catch (error) {
    logger.error(error);
  }
}

export const sendSms = async (phone: any, msg: any) => {
  return 200;
};

/**
 * Will return random number.
 * @returns {pin}
 */
export const getPin = (): number => {
  return Math.floor(10000 + Math.random() * 9000);
};

/**
 * Will return random number.
 * @returns {otp}
 */
export const getOtp = (): number => {
  return Math.floor(100000 + Math.random() * 9000);
};

export const generateTrackingId = (len: number | undefined) => {
  return (
    Math.random().toString(36).substring(2, len) +
    Math.random().toString(36).substring(2, len)
  ).toUpperCase();
};

const getAppId = (type: PushType): string => {
  if (
    type === textConstant.dispatchRequest ||
    type === textConstant.dispatchApproval
  ) {
    return constants.oneSignalAppId ?? "";
  }
  // Add more conditions here if needed for other PushTypes
  return constants.oneSignalAppIdMerchant ?? "";
};

const createNotification = (
  type: PushType,
  headings: string,
  ids: string[],
  data: PushDataDTO
): NotificationBase => {
  const appId = getAppId(type);
  if (!appId) {
    throw new Error(`No app ID found for push type: ${type}`);
  }

  const baseNotification: NotificationBase = {
    app_id: appId,
    data,
    include_aliases: { external_id: ids },
    target_channel: "push",
    included_segments: ["Active Users"],
    ios_sound: "mixkit-arabian-mystery-harp-notification-2489",
    android_channel_id: "20e11aa0-ca6c-4d2b-bd35-53a673523f1b",
    largeIcon: "ic_onesignal_large_icon_default",
    lockScreenVisibility: 1,
    smallIcon: "ic_stat_onesignal_default",
    smallIconAccentColor: "008967",
    android_sound: "mixkit_arabian_mystery_harp_notification_2489",
    priority: 10,
    headings: { en: headings },
    contents: { en: "" }, // We'll set this based on the type
  };

  // Set contents based on the push type
  if (
    type === textConstant.dispatchRequest &&
    "pickUpAddress" in data &&
    "dropOffAddress" in data
  ) {
    baseNotification.contents.en = `A Ride is being requested. \n \nPickup from ${data.pickUpAddress} and deliver to ${data.dropOffAddress}`;
  } else if (type === textConstant.dispatchApproval) {
    baseNotification.contents.en =
      textConstant.pushNotifications.english.dispatchApprovalMessage;
  } else {
    // For other types, you might want to set a default message or handle it differently
    baseNotification.contents.en =
      textConstant.pushNotifications.english.generic;
  }

  return baseNotification;
};

export const sendPush = async (
  type: PushType,
  headings: string,
  ids: string[],
  data: PushDataDTO
): Promise<any> => {
  if (!constants.oneSignalApiUrl) {
    throw new Error("OneSignal API URL is missing");
  }

  const oneSignalToken =
    type === textConstant.dispatchApproval ||
    type === textConstant.dispatchRequest
      ? constants.oneSignalToken
      : constants.oneSignalTokenMerchant;

  if (!oneSignalToken) {
    throw new Error(`No OneSignal token found for push type: ${type}`);
  }

  const notification = createNotification(type, headings, ids, data);

  try {
    const response = await axios.post(constants.oneSignalApiUrl, notification, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${oneSignalToken}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error instanceof OneSignal.HTTPError) {
      logger.info(`OneSignal HTTP Error - Status Code: ${error.statusCode}`);
      logger.info(`Error Body: ${JSON.stringify(error.body)}`);
    } else {
      logger.error("An unexpected error occurred", error);
    }
    throw error; // Re-throw the error for the caller to handle
  }
};

export const isVerified = (options = {}) => {
  return async (context: HookContext) => {
    if (context.params && context.params.user) {
      if (context.params.user.is_verified !== true) {
        throw new Forbidden("This user has not been verified");
      }
    }
    return context;
  };
};

export const checkPaystackPayment = async (paymentRef: any) => {
  try {
    const response = await axios.get(
      `${constants.paystackVerifyUrl}${paymentRef}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${constants.paystack.key}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkDistanceAndTime = async (pickup: any, dropoff: any) => {
  try {
    const response = await axios.get(
      `${constants.googleDirectionConfig.url}origin=${pickup}&destination=${dropoff}&key=${constants.googleDirectionConfig.key}&mode=driving&traffic_model=best_guess&departure_time=now`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkDistanceAndTimeUsingLongLat = async (
  pickup: any,
  dropoff: any
) => {
  try {
    const response = await axios.get(
      `${constants.googleDirectionConfig.url}origin=${pickup.latitude},${pickup.longitude}&destination=${dropoff.latitude},${dropoff.longitude}&key=${constants.googleDirectionConfig.key}&mode=driving&traffic_model=best_guess&departure_time=now`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const calculatePrice = async (
  distance: number,
  time: number,
  settings: {
    baseFare: number;
    ratePerKilometer: number;
    ratePerMinute: number;
  }
) => {
  return Math.round(
    settings.baseFare +
      distance * settings.ratePerKilometer +
      time * settings.ratePerMinute
  );
};

export const getStateFromLatLngWithOpenMap = async (data: {
  lat: any;
  lng: any;
}) => {
  const NodeGeocoder = require("node-geocoder");

  const options = {
    provider: "openstreetmap",
  };

  const geocoder = NodeGeocoder(options);

  const res = await geocoder.reverse({ lat: data.lat, lon: data.lng });
  if (res.length > 0) {
    return res[0].state;
  }
  await getStateFromLatLngWithGoogle(data);
  // https://nominatim.openstreetmap.org/reverse?lat=7.3833249&lon=3.8252766&format=json  keep this as fallback endpoint
};

export const getStateFromLatLngWithGoogle = async (data: {
  lat: any;
  lng: any;
}) => {
  const NodeGeocoder = require("node-geocoder");

  const options = {
    provider: "google",
    apiKey: constants.googleDirectionConfig.key,
  };

  const geocoder = NodeGeocoder(options);

  const res = await geocoder.reverse({ lat: data.lat, lon: data.lng });
  if (res.length > 0) {
    logger.info(res[0].administrativeLevels.level1long);
    return res[0].administrativeLevels.level1long;
  }
  return "default";
};

export const successResponse = (
  data: any,
  status: number,
  messsage: string
) => {
  return {
    status: status,
    success: true,
    messsage,
    data,
  };
};

export const customErrorResponse = (status: number, messsage: string) => {
  return {
    status,
    success: false,
    messsage,
  };
};

export const successResponseWithPagination = (
  data: any,
  status: number,
  messsage: string
) => {
  return {
    status: status,
    success: true,
    messsage,
    ...data,
  };
};

export const validateLatLongObject = (location: any): boolean => {
  return (
    typeof location === "object" &&
    location !== null &&
    typeof location.latitude === "number" &&
    typeof location.longitude === "number"
  );
};

export const initializeTransaction = async (user: any, amount: number) => {

  try {
    const payload: any = {
      amount: amount * 100, // Paystack expects amount in kobo
      first_name: user.first_name,
      last_name: user.last_name,
    };

    if (user.email) {
      payload.email = user.email;
    }

    if (user.phone_number) {
      payload.phone = user.phone_number;
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      payload, // Paystack expects amount in kobo
      {
        headers: {
          Authorization: `Bearer ${constants.paystack.key}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new GeneralError(
      //@ts-ignore
      error
    );
  }
};

export const verifyTransaction = async (reference: string) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${constants.paystack.key}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new GeneralError("Failed to initialize Paystack transaction");
  }
};
