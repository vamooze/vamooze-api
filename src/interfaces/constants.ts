export enum AssetStatus {
    Active = 'active',
    Inactive = 'inactive'
}

export enum MessageStatus {
    Read = 'read',
    Unread = 'unread'
}
export interface EmailDTO {
    templateName: string;
    toEmail: string | undefined;
    subject: string;
    templateData: GlobalMergeVars[];
}

interface GlobalMergeVars {name: string,content: any}

export enum TemplateType {
    'Otp' = 'new-user-otp'
}

export enum TemplateName {
    'Otp' = 'OTP'
}

export enum Roles {
    Admin = 'admin',
    AssetOwner = 'asset-owner',
    Dispatch = 'dispatch',
    SuperAdmin = 'super-admin',
    BusinessOwner = 'business-owner'
}

export enum LeaseStatus {
    Ongoing = 'ongoing',
    Expired = 'expired'
}

export enum MaintenanceStatus {
    InProgress = 'in-progress',
    Pending = 'pending',
    Completed = 'completed'
}

export enum MaintenanceType {
    Repair = 'repair',
    Servicing = 'servicing'
}

export enum OAuthTypes {
    Google = 'google',
    Github = 'git-hub'
}

export enum PaymentMethod {
    Cash = 'cash',
    Card = 'card',
    Ussd = 'ussd',
    Bank = 'bank'
}

export enum DeliveryMethod {
    Car = 'car',
    Bike = 'bike',
    Truck = 'truck',
    Van = 'van',
    Bus = 'bus'
}

export enum RequestStatus {
    Pending = 'pending',
    Accepted = 'accepted',
    Enroute = 'enroute',
    Delivered = 'delivered'
}