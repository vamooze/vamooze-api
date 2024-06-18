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
    toEmail: string;
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
