export interface IPayload_login {
     public readonly secureAccountUrl?: string
     public readonly ipAddress?: string
     public readonly location?: string
     public readonly device?: string
     public readonly loginTime?: string
     public readonly firstName?: string
     public readonly uuid?: string
}

export interface IPayload_register {
     public readonly supportEmail?: string
     public readonly dashboardUrl?: string
     public readonly firstName?: string
     public readonly uuid?: string
}

export interface IPayload_forgetPassword {
     public readonly resetUrl?: string
     public readonly expiresIn?: string
     public readonly firstName?: string
     public readonly ipAddress?: string
     public readonly location?: string
     public readonly device?: string
     public readonly uuid?: string
}

export interface IPayload_verifyEmail {
     public readonly verifyUrl: string
     public readonly expiresIn: string
     public readonly firstName?: string
     public readonly uuid?: string
}

export interface IPayload_invite {
     public readonly firstName: string,
     public readonly inviterName: string,
     public readonly boardName: string,
     public readonly workspaceName: string,
     public readonly role: string,
     public readonly expiresIn: string,
     public readonly acceptUrl: string
     public readonly uuid?: string
}
