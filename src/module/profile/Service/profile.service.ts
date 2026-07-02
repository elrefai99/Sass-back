import * as bcrypt from 'bcryptjs'
import { RefreshSessionModel, UserModel } from '../../../schema'
import { idOf } from '../../../shared/document'
import { writeActivity } from '../../../shared/activity'
import { AppError } from '../../../utils/errors/app-error'
import type { ChangePasswordDTO, UpdateProfileDTO } from '../DTO/index.dto'

export class ProfileService {
  async updateProfile(userId: string, companyId: string, dto: UpdateProfileDTO) {
    const user = await UserModel.findOneAndUpdate({ _id: userId, companyId }, dto, { new: true })
    if (!user) {
      throw AppError.notFound('User not found', 'NOT_FOUND')
    }

    await writeActivity({
      companyId,
      actorId: userId,
      actorName: user.name,
      action: 'profile.updated',
      message: 'Profile updated',
      entity: `user:${userId}`,
    })

    return this.serializeUser(user)
  }

  async changePassword(userId: string, companyId: string, dto: ChangePasswordDTO) {
    const user = await UserModel.findOne({ _id: userId, companyId })
    if (!user) {
      throw AppError.notFound('User not found', 'NOT_FOUND')
    }

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash)
    if (!valid) {
      throw AppError.unauthorized('Current password is incorrect', 'INVALID_CREDENTIALS')
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12)
    await user.save()
    await RefreshSessionModel.updateMany({ userId, revokedAt: null }, { revokedAt: new Date() })

    await writeActivity({
      companyId,
      actorId: userId,
      actorName: user.name,
      action: 'profile.password_changed',
      message: 'Password changed',
      entity: `user:${userId}`,
    })

    return null
  }

  async listSessions(userId: string) {
    const sessions = await RefreshSessionModel.find({ userId, revokedAt: null }).sort({ lastUsedAt: -1 })
    return sessions.map((session) => ({
      id: idOf(session),
      userAgent: session.userAgent ?? null,
      ip: session.ip ?? null,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      lastUsedAt: session.lastUsedAt,
    }))
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await RefreshSessionModel.findOneAndUpdate(
      { _id: sessionId, userId, revokedAt: null },
      { revokedAt: new Date() },
      { new: true },
    )
    if (!session) {
      throw AppError.notFound('Session not found', 'NOT_FOUND')
    }

    return null
  }

  private serializeUser(user: any) {
    return {
      id: idOf(user),
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl ?? null,
    }
  }
}

export const profileService = new ProfileService()
