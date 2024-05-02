import type { HookContext } from '../declarations';
export declare const formatPhoneNumber: (phoneNumber: string) => string;
/**
 * @argument content @argument to @argument subject @argument type
 * @param to
 * @param subject
 * @param type
 */
export declare const sendEmail: (content: any, to: any, subject: any, type: any) => void;
export declare const sendSms: (phone: any, msg: any) => Promise<void>;
/**
 * Will return random number.
 * @returns {pin}
 */
export declare const getPin: () => number;
/**
 * Will return random number.
 * @returns {otp}
 */
export declare const getOtp: () => number;
export declare const generateTrackingId: (len: number | undefined) => string;
export declare const sendPush: (type: string, content: any, ids: any, data: any, playSound: any) => Promise<void>;
export declare const isVerified: (options?: {}) => (context: HookContext) => Promise<HookContext>;
export declare const checkPaystackPayment: (paymentRef: any) => Promise<any>;
export declare const checkDistanceAndTime: (pickup: any, dropoff: any) => Promise<any>;
export declare const calculatePrice: (distance: number, time: number, settings: {
    baseFare: number;
    ratePerKilometer: number;
    ratePerMinute: number;
}) => Promise<number>;
export declare const getStateFromLatLngWithOpenMap: (data: {
    lat: any;
    lng: any;
}) => Promise<any>;
export declare const getStateFromLatLngWithGoogle: (data: {
    lat: any;
    lng: any;
}) => Promise<any>;
