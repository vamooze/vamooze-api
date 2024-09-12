require("dotenv").config();

export const constants = {
  accessToken: process.env.ACCESSTOKEN,
  uid: process.env.LUID,
  clientToken: process.env.CLIENTOKEN,
  baseUrl: process.env.BASEURL,
  mailGun: process.env.MAILGUN,
  mailGunDomain: process.env.MAILGUN_DOMAIN,
  oneSignalAppId: process.env.ONESIGNAL_APP_ID,
  oneSignalToken: process.env.ONESIGNAL_TOKEN,
  amazonAccessKeyId: process.env.AMAZONACCESSKEYID,
  amazonSecretAccessKey: process.env.AMAZONSECRETACCESSKEY,
  awsRegion: process.env.AWSREGION,
  paystackVerifyUrl: process.env.PAYSTACKVERIFYURL,
  oneSignalAppIdMerchant: process.env.ONESIGNAL_APP_IDMERCHANT,
  oneSignalTokenMerchant: process.env.ONESIGNAL_TOKENMERCHANT,
  liveLocationInterval: Number(process.env.LIVE_LOCATION_INTERVAL_IN_MINUTES),
  whiteLabelAminBaseFee: 2000,
  feePerKm: 5,
  feePerMin: 3,
  oneSignalApiUrl: process.env.ONESIGNAL_URL,

  enumConfig: {
    vehicleTypes: process.env.VEHICLETYPES
      ? process.env.VEHICLETYPES.split(",")
      : ["Bike", "Car", "Van", "Truck"],
  },

  googleDirectionConfig: {
    url:
      process.env.GOOGLEDIRECTIONBASEURL ||
      "https://maps.googleapis.com/maps/api/directions/json?",
    key: process.env.GOOGLEDIRECTIONKEY,
  },

  redisConfig: {
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || "6379",
    ssl: process.env.REDIS_SSL || false,
  },

  queueConfig: {
    concurrency: process.env.CONCURRENCY || 5,
  },

  mailchimpConfig: {
    apiKey: process.env.MAILCHIMP_API_KEY,
  },
  azureStorageConfig: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  },
  termii: {
    apiKey: process.env.TERMII_API_KEY,
    baseUrl: process.env.TERMII_BASE_URL,
  },

  azureEmailConfig: {
    senderAddress: process.env.AZURE_EMAIL_SENDER_ADDRESS,
    connectionString: process.env.AZURE_EMAIL_CONNECTION_STRING,
  },

  whatsAppApi: {
    api_key: process.env.WHATSAPP_LOYSTAR_API_KEY,
    merchant_id: process.env.WHATSAPP_LOYSTAR_MERCHANT_ID,
    phone_wid: process.env.WHATSAPP_LOYSTAR_PHONE_WID,
  },

  paystack:{
    key: process.env.PAYSTACK_SECRET_KEY_TEST
  }
};
