import { constants } from './constants';
import axios from 'axios';
import OneSignal from 'onesignal-node';
import { Forbidden } from '@feathersjs/errors';
import type { HookContext } from '../declarations';

export const formatPhoneNumber = (phoneNumber: string) => {
  if(phoneNumber.substring(0,1) === '0'){
    return '+234' + phoneNumber.substring(phoneNumber.length - 10);
  }else if(phoneNumber.substring(0,4) === '+234'){
    return phoneNumber;
  }else if(phoneNumber.substring(0,3) === '234'){
    return '+' + phoneNumber;
  }else{
    return phoneNumber;
  }
};

/**
 * @argument content @argument to @argument subject @argument type
 * @param to
 * @param subject
 * @param type
 */
export const sendEmail = (content: any, to: any, subject: any, type: any) => {
  const AWS = require('aws-sdk')
  // Set the region
  AWS.config.update({
    region: constants.awsRegion,
    accessKeyId: constants.amazonAccessKeyId,
    secretAccessKey: constants.amazonSecretAccessKey,
  });
  // Create sendEmail params
  const params = {
    Destination: { /* required */
      //   CcAddresses: [
      //     'brainiacten@gmail.com',
      //     /* more items */
      //   ],
      ToAddresses: [
        to
      ]
    },
    Message: { /* required */
      Body: { /* required */
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
  }

  // Create the promise and SES service object
  const sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise().then(
    function(data: { MessageId: any; }) {
      console.log(data.MessageId)
    }).catch(
    function(err: { stack: any; }) {
      console.error(err, err.stack)
    })

};


export const sendSms = async (phone: any, msg: any) => {

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
  return (Math.random().toString(36).substring(2, len) + Math.random().toString(36).substring(2, len) ).toUpperCase();
};

export const sendPush = async (type: string, content: any, ids: any, data: any, playSound: any ) => {
  let oneSignalToken: any, appId : any;
  if (type === 'dispatch') {
    oneSignalToken = constants.oneSignalToken;
    appId = constants.oneSignalAppId;
  } else {
    oneSignalToken = constants.oneSignalToken;
    appId = constants.oneSignalAppId;
  }
  const client = new OneSignal.Client(appId, oneSignalToken);
  let notification: any = {
    contents: {
      'en': content,
    },
    include_player_ids: ids,
    data: data && data
  };
  if(playSound) {
    notification['ios_sound'] = 'beep-notif.wav';
    notification['android_channel_id'] = '50a280f7-91f6-40c6-a950-469b3505cd7f';
    notification['adm_sound'] = 'exploade_sound';
  }

  try {
    const response = await client.createNotification(notification);
    console.log('====================================');
    console.log(response.body);
    console.log('====================================');
  } catch (e) {
    console.log('====================================');
    console.log(e);
    console.log('====================================');
    if (e instanceof OneSignal.HTTPError) {
      // When status code of HTTP response is not 2xx, HTTPError is thrown.
      console.log(e.statusCode);
      console.log(e.body);
    }
  }
};


export const isVerified = (options = {}) => {
  return async (context: HookContext) => {
    if(context.params && context.params.user){
      if(context.params.user.isVerified != true){
        throw new Forbidden('This user has not been verified');
      }
    }
    return context;
  };
};

export const checkPaystackPayment = async (paymentRef: any) => {
  try {
    const response = await axios.get(`${constants.paystackVerifyUrl}${paymentRef}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${constants.paystackPrivateKey}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const checkDistanceAndTime = async (pickup: any, dropoff: any) => {
  try {
    const response = await axios.get(`${constants.googleDirectionConfig.url}origin=${pickup}&destination=${dropoff}&key=${constants.googleDirectionConfig.key}&mode=driving&traffic_model=best_guess&departure_time=now`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const calculatePrice = async (distance: number, time: number, settings: { baseFare: number; ratePerKilometer: number; ratePerMinute: number }) => {
  return Math.round(settings.baseFare + (distance * settings.ratePerKilometer) + (time * settings.ratePerMinute));
};


export const getStateFromLatLngWithOpenMap = async (data: { lat: any; lng: any }) => {
  const NodeGeocoder = require('node-geocoder');

  const options = {
    provider: 'openstreetmap',
  };

  const geocoder = NodeGeocoder(options);

  const res = await geocoder.reverse({ lat:  data.lat, lon: data.lng });
  if(res.length > 0) {
    return res[0].state;
  }
  await getStateFromLatLngWithGoogle(data);
  // https://nominatim.openstreetmap.org/reverse?lat=7.3833249&lon=3.8252766&format=json  keep this as fallback endpoint
};

export const getStateFromLatLngWithGoogle = async (data: { lat: any; lng: any }) => {
  const NodeGeocoder = require('node-geocoder');

  const options = {
    provider: 'google',
    apiKey: constants.googleDirectionConfig.key,
  };

  const geocoder = NodeGeocoder(options);

  const res = await geocoder.reverse({ lat:  data.lat, lon: data.lng });
  if(res.length > 0) {
    console.log(res[0].administrativeLevels.level1long);
    return res[0].administrativeLevels.level1long;
  }
  return 'default';
};







