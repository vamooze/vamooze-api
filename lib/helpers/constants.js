"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constants = void 0;
require('dotenv').config();
exports.constants = {
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
    paystackPrivateKey: process.env.PAYSTACKPRIVATEKEY,
    paystackVerifyUrl: process.env.PAYSTACKVERIFYURL,
    oneSignalAppIdMerchant: process.env.ONESIGNAL_APP_IDMERCHANT,
    oneSignalTokenMerchant: process.env.ONESIGNAL_TOKENMERCHANT,
    liveLocationInterval: Number(process.env.LIVE_LOCATION_INTERVAL_IN_MINUTES),
    enumConfig: {
        vehicleTypes: process.env.VEHICLETYPES ? process.env.VEHICLETYPES.split(',') : ['Bike', 'Car', 'Van', 'Truck']
    },
    googleDirectionConfig: {
        url: process.env.GOOGLEDIRECTIONBASEURL || 'https://maps.googleapis.com/maps/api/directions/json?',
        key: process.env.GOOGLEDIRECTIONKEY || 'AIzaSyDmweksUR25uxL7Q40jUpZGRd0eZHkVroY'
    },
    redisConfig: {
        password: process.env.REDIS_PASSWORD,
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || '6379'
    },
    queueConfig: {
        concurrency: process.env.CONCURRENCY || 5
    }
};
//# sourceMappingURL=constants.js.map