import textConstant from "../helpers/textConstant";

export enum AssetStatus {
  Active = "active",
  Inactive = "inactive",
}

export const dispatchRequestValidators = {
  receiver_name_length: 255,
  receiver_phone_number_length: 15,
  package_description_length: 1000,
  landmark_length: 1000,
  delivery_address_length: 1000,
  pickup_address_length: 1000,
  delivery_instructions_length: 1000,
};

export enum MessageStatus {
  Read = "read",
  Unread = "unread",
}
export interface EmailDTO {
  toEmail: string | undefined;
  subject: string;
  templateData: string;
  receiptName: string;
}

interface GlobalMergeVars {
  name: string;
  content: any;
}

export enum TemplateType {
  "Otp" = "new-user-otp",
}

export enum TemplateName {
  "Otp" = "OTP",
}

export enum DispatchApprovalStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

export enum TransactionStatus {
  Pending = "pending",
  Completed = "completed",
  Failed = "failed",
}

export enum TransactionType {
  Deposit = "deposit",
  Withdrawal = "withdrawal",
}

export enum Roles {
  Admin = "admin",
  AssetOwner = "asset-owner",
  Dispatch = "dispatch",
  SuperAdmin = "super-admin",
  BusinessOwner = "business-owner",
  GuestUser = "guest-user",
  InHouseManager = 'In-house-manager'
}

export enum LeaseStatus {
  Ongoing = "ongoing",
  Expired = "expired",
}

export enum DispatchDecisionDTO {
  Accept = "accept",
  Reject = "reject",
}

export enum MaintenanceStatus {
  InProgress = "in-progress",
  Pending = "pending",
  Completed = "completed",
}

export enum MaintenanceType {
  Repair = "repair",
  Servicing = "servicing",
}

export enum OAuthTypes {
  Google = "google",
  Github = "git-hub",
}

export enum PaymentMethod {
  Cash = "cash",
  Card = "card",
  Ussd = "ussd",
  Bank = "bank",
}

export enum DeliveryMethod {
  Car = "car",
  Bike = "bike",
  Truck = "truck",
  Van = "van",
  Bus = "bus",
}

export enum RequestStatus {
  Pending = "pending",
  Accepted = "accepted",
  EnrouteToPickUp = "to_pickup",
  EnrouteToDropOff = "to_drop_off",
  Delivered = "delivered",
  Expired = "expired",
  CompletePickUp = "complete_pick_up",
  CompleteDropOff = "complete_drop_off",
  Cancelled = 'cancelled'
}




 interface DispatchRequestDTO {
  timeToUser: number;
  amountFrom: number;
  amountTo: number;
  pickUpAddress: string;
  dropOffAddress: string;
  currency: string;
  paymentType: string;
}

export type PushDataDTO = DispatchRequestDTO | Record<string, any>;

export type PushType =
  | typeof textConstant.dispatchRequest
  | typeof textConstant.dispatchApproval;


export interface NotificationBase {
  app_id: string;
  data: PushDataDTO;
  include_aliases: {
    external_id: string[];
  };
  target_channel: "push";
  included_segments: string[];
  ios_sound: string;
  android_channel_id: string;
  largeIcon: string;
  lockScreenVisibility: number;
  smallIcon: string;
  smallIconAccentColor: string;
  android_sound: string;
  priority: number;
  headings: { en: string };
  contents: { en: string };
}