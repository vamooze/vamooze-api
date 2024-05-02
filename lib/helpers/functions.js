"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStateFromLatLngWithGoogle = exports.getStateFromLatLngWithOpenMap = exports.calculatePrice = exports.checkDistanceAndTime = exports.checkPaystackPayment = exports.isVerified = exports.sendPush = exports.generateTrackingId = exports.getOtp = exports.getPin = exports.sendSms = exports.sendEmail = exports.formatPhoneNumber = void 0;
const constants_1 = require("./constants");
const axios_1 = __importDefault(require("axios"));
const onesignal_node_1 = __importDefault(require("onesignal-node"));
const errors_1 = require("@feathersjs/errors");
const formatPhoneNumber = (phoneNumber) => {
    if (phoneNumber.substring(0, 1) === '0') {
        return '+234' + phoneNumber.substring(phoneNumber.length - 10);
    }
    else if (phoneNumber.substring(0, 4) === '+234') {
        return phoneNumber;
    }
    else if (phoneNumber.substring(0, 3) === '234') {
        return '+' + phoneNumber;
    }
    else {
        return phoneNumber;
    }
};
exports.formatPhoneNumber = formatPhoneNumber;
/**
 * @argument content @argument to @argument subject @argument type
 * @param to
 * @param subject
 * @param type
 */
const sendEmail = (content, to, subject, type) => {
    const AWS = require('aws-sdk');
    // Set the region
    AWS.config.update({
        region: constants_1.constants.awsRegion,
        accessKeyId: constants_1.constants.amazonAccessKeyId,
        secretAccessKey: constants_1.constants.amazonSecretAccessKey,
    });
    // Create sendEmail params
    const params = {
        Destination: {
            //   CcAddresses: [
            //     'brainiacten@gmail.com',
            //     /* more items */
            //   ],
            ToAddresses: [
                to
            ]
        },
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: `${type = 'html' ? content : ''}`
                },
                Text: {
                    Charset: 'UTF-8',
                    Data: `${type = 'text' ? content : ''}`
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject
            }
        },
        Source: 'BeepBeep <admin@beepbeep.ng>', /* required */
        ReplyToAddresses: [
            'admin@beepbeep.ng'
            /* more items */
        ]
    };
    // Create the promise and SES service object
    const sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise().then(function (data) {
        console.log(data.MessageId);
    }).catch(function (err) {
        console.error(err, err.stack);
    });
};
exports.sendEmail = sendEmail;
const sendSms = async (phone, msg) => {
};
exports.sendSms = sendSms;
/**
 * Will return random number.
 * @returns {pin}
 */
const getPin = () => {
    return Math.floor(10000 + Math.random() * 9000);
};
exports.getPin = getPin;
/**
 * Will return random number.
 * @returns {otp}
 */
const getOtp = () => {
    return Math.floor(100000 + Math.random() * 9000);
};
exports.getOtp = getOtp;
const generateTrackingId = (len) => {
    return (Math.random().toString(36).substring(2, len) + Math.random().toString(36).substring(2, len)).toUpperCase();
};
exports.generateTrackingId = generateTrackingId;
const sendPush = async (type, content, ids, data, playSound) => {
    let oneSignalToken, appId;
    if (type === 'dispatch') {
        oneSignalToken = constants_1.constants.oneSignalToken;
        appId = constants_1.constants.oneSignalAppId;
    }
    else {
        oneSignalToken = constants_1.constants.oneSignalToken;
        appId = constants_1.constants.oneSignalAppId;
    }
    const client = new onesignal_node_1.default.Client(appId, oneSignalToken);
    let notification = {
        contents: {
            'en': content,
        },
        include_player_ids: ids,
        data: data && data
    };
    if (playSound) {
        notification['ios_sound'] = 'beep-notif.wav';
        notification['android_channel_id'] = '50a280f7-91f6-40c6-a950-469b3505cd7f';
        notification['adm_sound'] = 'exploade_sound';
    }
    try {
        const response = await client.createNotification(notification);
        console.log('====================================');
        console.log(response.body);
        console.log('====================================');
    }
    catch (e) {
        console.log('====================================');
        console.log(e);
        console.log('====================================');
        if (e instanceof onesignal_node_1.default.HTTPError) {
            // When status code of HTTP response is not 2xx, HTTPError is thrown.
            console.log(e.statusCode);
            console.log(e.body);
        }
    }
};
exports.sendPush = sendPush;
const isVerified = (options = {}) => {
    return async (context) => {
        if (context.params && context.params.user) {
            if (context.params.user.isVerified != true) {
                throw new errors_1.Forbidden('This user has not been verified');
            }
        }
        return context;
    };
};
exports.isVerified = isVerified;
const checkPaystackPayment = async (paymentRef) => {
    try {
        const response = await axios_1.default.get(`${constants_1.constants.paystackVerifyUrl}${paymentRef}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${constants_1.constants.paystackPrivateKey}`
            }
        });
        return response.data;
    }
    catch (error) {
        throw error;
    }
};
exports.checkPaystackPayment = checkPaystackPayment;
const checkDistanceAndTime = async (pickup, dropoff) => {
    try {
        const response = await axios_1.default.get(`${constants_1.constants.googleDirectionConfig.url}origin=${pickup}&destination=${dropoff}&key=${constants_1.constants.googleDirectionConfig.key}&mode=driving&traffic_model=best_guess&departure_time=now`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }
    catch (error) {
        throw error;
    }
};
exports.checkDistanceAndTime = checkDistanceAndTime;
const calculatePrice = async (distance, time, settings) => {
    return Math.round(settings.baseFare + (distance * settings.ratePerKilometer) + (time * settings.ratePerMinute));
};
exports.calculatePrice = calculatePrice;
const getStateFromLatLngWithOpenMap = async (data) => {
    const NodeGeocoder = require('node-geocoder');
    const options = {
        provider: 'openstreetmap',
    };
    const geocoder = NodeGeocoder(options);
    const res = await geocoder.reverse({ lat: data.lat, lon: data.lng });
    if (res.length > 0) {
        return res[0].state;
    }
    await (0, exports.getStateFromLatLngWithGoogle)(data);
    // https://nominatim.openstreetmap.org/reverse?lat=7.3833249&lon=3.8252766&format=json  keep this as fallback endpoint
};
exports.getStateFromLatLngWithOpenMap = getStateFromLatLngWithOpenMap;
const getStateFromLatLngWithGoogle = async (data) => {
    const NodeGeocoder = require('node-geocoder');
    const options = {
        provider: 'google',
        apiKey: constants_1.constants.googleDirectionConfig.key,
    };
    const geocoder = NodeGeocoder(options);
    const res = await geocoder.reverse({ lat: data.lat, lon: data.lng });
    if (res.length > 0) {
        console.log(res[0].administrativeLevels.level1long);
        return res[0].administrativeLevels.level1long;
    }
    return 'default';
};
exports.getStateFromLatLngWithGoogle = getStateFromLatLngWithGoogle;
//# sourceMappingURL=functions.js.map