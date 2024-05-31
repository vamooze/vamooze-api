export enum AssetStatus {
    Active = 'active',
    Inactive = 'inactive'
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
