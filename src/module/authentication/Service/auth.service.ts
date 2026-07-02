import * as bcrypt from 'bcryptjs'
import { generateUUID } from '../../../utils/uuid'
import {
  CompanyModel,
  DepartmentModel,
  PasswordResetTokenModel,
  RefreshSessionModel,
  SubscriptionModel,
  UserModel,
} from '../../../schema'
import { addJobToQueue } from '../../../MessageQueue/emails/Queue/queue.email'
import { AppError } from '../../../utils/errors/app-error'
import { addDays, createOpaqueToken, hashToken, signAccessToken } from '../../../shared/security'
import { plans } from '../../../shared/plans'
import { idOf } from '../../../shared/document'
import type {
  ForgotPasswordDTO,
  LoginDTO,
  LogoutDTO,
  RefreshTokenDTO,
  RegisterCompanyDTO,
  ResetPasswordDTO,
} from '../DTO/index.dto'
import type { SessionClient } from '../@types'

const DEFAULT_DEPARTMENTS = [
  { name: 'HR', description: 'People operations', color: '#f472b6' },
  { name: 'Finance', description: 'Finance and accounting', color: '#22c55e' },
  { name: 'Sales', description: 'Sales operations', color: '#f97316' },
  { name: 'Marketing', description: 'Growth and marketing', color: '#a855f7' },
  { name: 'IT', description: 'Internal systems', color: '#06b6d4' },
]

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export class AuthenticationService {
  async registerCompany(dto: RegisterCompanyDTO, client: SessionClient) {
    const existing = await UserModel.exists({ email: dto.owner.email })
    if (existing) {
      throw AppError.conflict('Email already registered', 'CONFLICT')
    }

    const baseSlug = slugify(dto.company.name)
    const slug = (await CompanyModel.exists({ slug: baseSlug })) ? `${baseSlug}-${generateUUID().slice(0, 6)}` : baseSlug
    const now = new Date()
    const plan = plans[dto.plan]
    const passwordHash = await bcrypt.hash(dto.owner.password, 12)

    const company = await CompanyModel.create({
      ...dto.company,
      slug,
    })

    const user = await UserModel.create({
      companyId: company._id,
      name: dto.owner.name,
      email: dto.owner.email,
      passwordHash,
      role: 'owner',
    })

    await DepartmentModel.insertMany(
      DEFAULT_DEPARTMENTS.map((department) => ({
        ...department,
        companyId: company._id,
        isDefault: true,
      })),
    )

    const subscription = await SubscriptionModel.create({
      companyId: company._id,
      plan: dto.plan,
      status: dto.plan === 'trial' ? 'trialing' : 'active',
      seats: plan.seats ?? 999999,
      trialEndsAt: dto.plan === 'trial' ? addDays(now, plan.trialDays ?? 14) : null,
      currentPeriodEnd: dto.plan === 'trial' ? null : addDays(now, 30),
    })

    const tokens = await this.createSession(user, client)

    await this.queueEmail('register', user.email, 'Welcome to Nexora ERP', {
      name: user.name,
      company: company.name,
    })

    return {
      ...this.sessionContext(user, company, subscription),
      ...tokens,
    }
  }

  async login(dto: LoginDTO, client: SessionClient) {
    const user = await UserModel.findOne({ email: dto.email })
    if (!user) {
      throw AppError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS')
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) {
      throw AppError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS')
    }

    if (!user.isActive) {
      throw AppError.forbidden('User deactivated', 'FORBIDDEN')
    }

    const [company, subscription] = await Promise.all([
      CompanyModel.findById(user.companyId),
      SubscriptionModel.findOne({ companyId: user.companyId }),
    ])

    if (!company || !subscription) {
      throw AppError.unauthorized('Invalid session context', 'TOKEN_INVALID')
    }

    const tokens = await this.createSession(user, client)
    await this.queueEmail('login', user.email, 'New login to Nexora ERP', { name: user.name })

    return {
      ...this.sessionContext(user, company, subscription),
      ...tokens,
    }
  }

  async refresh(dto: RefreshTokenDTO, client: SessionClient) {
    const tokenHash = hashToken(dto.refreshToken)
    const session = await RefreshSessionModel.findOne({ tokenHash })

    if (!session) {
      throw AppError.unauthorized('Refresh token invalid', 'TOKEN_INVALID')
    }

    if (session.revokedAt) {
      await RefreshSessionModel.updateMany({ familyId: session.familyId }, { revokedAt: new Date() })
      throw AppError.unauthorized('Refresh token invalid', 'TOKEN_INVALID')
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw AppError.unauthorized('Refresh token expired', 'TOKEN_EXPIRED')
    }

    const user = await UserModel.findById(session.userId)
    if (!user || !user.isActive) {
      throw AppError.unauthorized('Refresh token invalid', 'TOKEN_INVALID')
    }

    session.revokedAt = new Date()
    session.lastUsedAt = new Date()
    await session.save()

    return this.createSession(user, client, session.familyId)
  }

  async logout(dto: LogoutDTO) {
    if (!dto.refreshToken) {
      return null
    }

    await RefreshSessionModel.updateOne(
      { tokenHash: hashToken(dto.refreshToken), revokedAt: null },
      { revokedAt: new Date() },
    )

    return null
  }

  async forgotPassword(dto: ForgotPasswordDTO) {
    const user = await UserModel.findOne({ email: dto.email })
    if (!user) {
      return null
    }

    const token = createOpaqueToken()
    await PasswordResetTokenModel.create({
      userId: user._id,
      tokenHash: hashToken(token),
      expiresAt: addDays(new Date(), 1 / 24),
    })

    await this.queueEmail('forgatePassword', user.email, 'Reset your Nexora ERP password', {
      name: user.name,
      token,
    })

    return null
  }

  async resetPassword(dto: ResetPasswordDTO) {
    const resetToken = await PasswordResetTokenModel.findOne({
      tokenHash: hashToken(dto.token),
      usedAt: null,
    })

    if (!resetToken) {
      throw AppError.unauthorized('Reset token invalid', 'TOKEN_INVALID')
    }

    if (resetToken.expiresAt.getTime() <= Date.now()) {
      throw AppError.unauthorized('Reset token expired', 'TOKEN_EXPIRED')
    }

    const passwordHash = await bcrypt.hash(dto.password, 12)
    await UserModel.updateOne({ _id: resetToken.userId }, { passwordHash })
    resetToken.usedAt = new Date()
    await resetToken.save()
    await RefreshSessionModel.updateMany({ userId: resetToken.userId, revokedAt: null }, { revokedAt: new Date() })

    return null
  }

  async me(userId: string) {
    const user = await UserModel.findById(userId)
    if (!user || !user.isActive) {
      throw AppError.unauthorized('Invalid session', 'TOKEN_INVALID')
    }

    const [company, subscription] = await Promise.all([
      CompanyModel.findById(user.companyId),
      SubscriptionModel.findOne({ companyId: user.companyId }),
    ])

    if (!company || !subscription) {
      throw AppError.unauthorized('Invalid session context', 'TOKEN_INVALID')
    }

    return this.sessionContext(user, company, subscription)
  }

  private async createSession(user: any, client: SessionClient, familyId = generateUUID()) {
    const refreshToken = createOpaqueToken()

    await RefreshSessionModel.create({
      userId: user._id,
      familyId,
      tokenHash: hashToken(refreshToken),
      userAgent: client.userAgent,
      ip: client.ip,
      expiresAt: addDays(new Date(), 30),
    })

    return {
      accessToken: signAccessToken({
        sub: idOf(user),
        companyId: user.companyId.toString(),
        role: user.role,
      }),
      refreshToken,
    }
  }

  private sessionContext(user: any, company: any, subscription: any) {
    return {
      user: {
        id: idOf(user),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl ?? null,
      },
      company: {
        id: idOf(company),
        name: company.name,
        slug: company.slug,
        logoUrl: company.logoUrl ?? null,
        industry: company.industry,
        size: company.size,
        country: company.country,
        timezone: company.timezone,
        language: company.language,
        onboardedAt: company.onboardedAt,
      },
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        trialEndsAt: subscription.trialEndsAt,
        renewsAt: subscription.currentPeriodEnd,
        seats: subscription.seats,
      },
    }
  }

  private async queueEmail(type: string, email: string, subject: string, emailBody: Record<string, unknown>) {
    try {
      await addJobToQueue('sendEmail', {
        type,
        email,
        subject,
        emailBody,
      })
    } catch {
      // Email queues should not break API writes.
    }
  }
}

export const authenticationService = new AuthenticationService()
