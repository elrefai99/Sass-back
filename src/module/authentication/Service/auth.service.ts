import * as bcrypt from 'bcryptjs'
import { generateUUID } from '../../../utils/uuid'
import {
  CompanyModel,
  DepartmentModel,
  EmailVerificationTokenModel,
  InvitationModel,
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
import { ensureEmployeeProfile } from '../../../shared/ensure-employee'
import { writeActivity } from '../../../shared/activity'
import type {
  AcceptInvitationDTO,
  ForgotPasswordDTO,
  LoginDTO,
  LogoutDTO,
  RefreshTokenDTO,
  RegisterCompanyDTO,
  ResetPasswordDTO,
  VerifyEmailDTO,
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

    // Give the owner an employee profile so self-service features (attendance,
    // assignment, etc.) work for them just like any other team member.
    await ensureEmployeeProfile(idOf(company), idOf(user))

    const subscription = await SubscriptionModel.create({
      companyId: company._id,
      plan: dto.plan,
      status: dto.plan === 'trial' ? 'trialing' : 'active',
      seats: plan.seats ?? 999999,
      trialEndsAt: dto.plan === 'trial' ? addDays(now, plan.trialDays ?? 14) : null,
      currentPeriodEnd: dto.plan === 'trial' ? null : addDays(now, 30),
    })

    const tokens = await this.createSession(user, client)

    await this.queueEmail('register', user.email, 'Welcome to SwakipOS ERP', {
      name: user.name,
      company: company.name,
    })
    await this.sendVerificationEmail(user)

    await writeActivity({
      companyId: idOf(company),
      actorId: idOf(user),
      actorName: user.name,
      action: 'auth.company_registered',
      message: `${company.name} registered by ${user.name}`,
      entity: `company:${idOf(company)}`,
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
    await this.queueEmail('login', user.email, 'New login to SwakipOS ERP', { name: user.name })
    await writeActivity({
      companyId: user.companyId.toString(),
      actorId: idOf(user),
      actorName: user.name,
      action: 'auth.login',
      message: `${user.name} logged in`,
      entity: `user:${idOf(user)}`,
    })

    return {
      ...this.sessionContext(user, company, subscription),
      ...tokens,
    }
  }

  async refresh(dto: RefreshTokenDTO, client: SessionClient) {
    const tokenHash = hashToken(dto.refreshToken)

    // Atomically claim the token: the `{ revokedAt: null }` filter guarantees
    // that only one concurrent request can flip it, eliminating the rotation
    // race. Returns the pre-update document (revokedAt still null as it was).
    const session = await RefreshSessionModel.findOneAndUpdate(
      { tokenHash, revokedAt: null },
      { revokedAt: new Date(), lastUsedAt: new Date() },
      { new: false },
    )

    if (!session) {
      // No live session for this hash. If a (revoked) row exists, the token was
      // already rotated — treat as reuse and revoke the whole family.
      await this.handlePossibleReuse(tokenHash)
      throw AppError.unauthorized('Refresh token invalid', 'TOKEN_INVALID')
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw AppError.unauthorized('Refresh token expired', 'TOKEN_EXPIRED')
    }

    const user = await UserModel.findById(session.userId)
    if (!user || !user.isActive) {
      throw AppError.unauthorized('Refresh token invalid', 'TOKEN_INVALID')
    }

    return this.createSession(user, client, session.familyId)
  }

  private async handlePossibleReuse(tokenHash: string) {
    const reused = await RefreshSessionModel.findOne({ tokenHash })
    if (!reused) return

    await RefreshSessionModel.updateMany({ familyId: reused.familyId }, { revokedAt: new Date() })
    const owner = await UserModel.findById(reused.userId).select('companyId name')
    if (owner) {
      await writeActivity({
        companyId: owner.companyId.toString(),
        actorId: reused.userId.toString(),
        actorName: owner.name,
        action: 'auth.refresh_token_reuse_detected',
        message: `Refresh token reuse detected for ${owner.name}; session family revoked`,
        entity: `user:${reused.userId.toString()}`,
      })
    }
  }

  async logout(dto: LogoutDTO, actor?: { id: string; companyId: string; name?: string }) {
    if (!dto.refreshToken) {
      return null
    }

    await RefreshSessionModel.updateOne(
      { tokenHash: hashToken(dto.refreshToken), revokedAt: null },
      { revokedAt: new Date() },
    )

    if (actor) {
      await writeActivity({
        companyId: actor.companyId,
        actorId: actor.id,
        actorName: actor.name,
        action: 'auth.logout',
        message: `${actor.name ?? 'User'} logged out`,
        entity: `user:${actor.id}`,
      })
    }

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

    await this.queueEmail('forgatePassword', user.email, 'Reset your SwakipOS ERP password', {
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
    const user = await UserModel.findByIdAndUpdate(resetToken.userId, { passwordHash })
    resetToken.usedAt = new Date()
    await resetToken.save()
    await RefreshSessionModel.updateMany({ userId: resetToken.userId, revokedAt: null }, { revokedAt: new Date() })

    if (user) {
      await writeActivity({
        companyId: user.companyId.toString(),
        actorId: idOf(user),
        actorName: user.name,
        action: 'auth.password_reset',
        message: `${user.name} reset their password`,
        entity: `user:${idOf(user)}`,
      })
    }

    return null
  }

  async acceptInvitation(dto: AcceptInvitationDTO, client: SessionClient) {
    const invitation = await InvitationModel.findOne({
      tokenHash: hashToken(dto.token),
      status: 'pending',
    })

    if (!invitation) {
      throw AppError.unauthorized('Invitation invalid', 'TOKEN_INVALID')
    }

    if (invitation.expiresAt.getTime() <= Date.now()) {
      throw AppError.unauthorized('Invitation expired', 'TOKEN_EXPIRED')
    }

    const existing = await UserModel.exists({ email: invitation.email })
    if (existing) {
      throw AppError.conflict('Email already registered', 'CONFLICT')
    }

    const passwordHash = await bcrypt.hash(dto.password, 12)
    const user = await UserModel.create({
      companyId: invitation.companyId,
      name: dto.name,
      email: invitation.email,
      passwordHash,
      role: invitation.role,
    })

    invitation.status = 'accepted'
    await invitation.save()

    // Ensure the newly-joined user has an employee profile.
    await ensureEmployeeProfile(invitation.companyId.toString(), idOf(user))

    const [company, subscription] = await Promise.all([
      CompanyModel.findById(invitation.companyId),
      SubscriptionModel.findOne({ companyId: invitation.companyId }),
    ])

    if (!company || !subscription) {
      throw AppError.unauthorized('Invalid session context', 'TOKEN_INVALID')
    }

    const tokens = await this.createSession(user, client)
    await this.queueEmail('register', user.email, 'Welcome to SwakipOS ERP', {
      name: user.name,
      company: company.name,
    })
    await this.sendVerificationEmail(user)

    await writeActivity({
      companyId: idOf(company),
      actorId: idOf(user),
      actorName: user.name,
      action: 'auth.invitation_accepted',
      message: `${user.name} accepted an invitation and joined ${company.name}`,
      entity: `user:${idOf(user)}`,
    })

    return {
      ...this.sessionContext(user, company, subscription),
      ...tokens,
    }
  }

  async verifyEmail(dto: VerifyEmailDTO) {
    const verificationToken = await EmailVerificationTokenModel.findOne({
      tokenHash: hashToken(dto.token),
      usedAt: null,
    })

    if (!verificationToken) {
      throw AppError.unauthorized('Verification token invalid', 'TOKEN_INVALID')
    }

    if (verificationToken.expiresAt.getTime() <= Date.now()) {
      throw AppError.unauthorized('Verification token expired', 'TOKEN_EXPIRED')
    }

    const user = await UserModel.findByIdAndUpdate(verificationToken.userId, { emailVerifiedAt: new Date() })
    verificationToken.usedAt = new Date()
    await verificationToken.save()

    if (user) {
      await writeActivity({
        companyId: user.companyId.toString(),
        actorId: idOf(user),
        actorName: user.name,
        action: 'auth.email_verified',
        message: `${user.name} verified their email`,
        entity: `user:${idOf(user)}`,
      })
    }

    return null
  }

  private async sendVerificationEmail(user: any) {
    const token = createOpaqueToken()
    await EmailVerificationTokenModel.create({
      userId: user._id,
      tokenHash: hashToken(token),
      expiresAt: addDays(new Date(), 3),
    })

    const siteUrl = process.env.SITE_URL_LIVE || process.env.SITE_URL_TEST || process.env.API_LINK || ''
    await this.queueEmail('verifyEmail', user.email, 'Verify your SwakipOS ERP email', {
      firstName: user.name,
      expiresIn: '3 days',
      verifyUrl: `${siteUrl.replace(/\/$/, '')}/verify-email?token=${token}`,
    })
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
