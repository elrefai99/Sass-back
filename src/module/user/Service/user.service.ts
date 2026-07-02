import { RefreshSessionModel, UserModel } from '../../../schema'
import { idOf } from '../../../shared/document'
import { writeActivity } from '../../../shared/activity'
import { buildMeta, parsePagination } from '../../../shared/pagination'
import { buildSearchFilter } from '../../../shared/filter'
import { AppError } from '../../../utils/errors/app-error'
import type { ListUsersQueryDTO, UpdateUserDTO } from '../DTO/index.dto'

export class UserService {
  async list(companyId: string, query: ListUsersQueryDTO) {
    const { page, pageSize, skip } = parsePagination(query)
    const filter: Record<string, unknown> = {
      companyId,
      ...buildSearchFilter(query.search, ['name', 'email']),
      ...(query.role ? { role: query.role } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    }

    const [users, total] = await Promise.all([
      UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      UserModel.countDocuments(filter),
    ])

    return {
      data: users.map((user) => this.serialize(user)),
      meta: buildMeta(page, pageSize, total),
    }
  }

  async get(companyId: string, userId: string) {
    const user = await UserModel.findOne({ _id: userId, companyId })
    if (!user) {
      throw AppError.notFound('User not found', 'NOT_FOUND')
    }

    return this.serialize(user)
  }

  async update(companyId: string, actor: { id: string; name?: string }, userId: string, dto: UpdateUserDTO) {
    const user = await UserModel.findOne({ _id: userId, companyId })
    if (!user) {
      throw AppError.notFound('User not found', 'NOT_FOUND')
    }

    if (user.role === 'owner') {
      throw AppError.forbidden('Cannot modify the company owner via this endpoint', 'FORBIDDEN')
    }

    if (dto.role === 'owner') {
      throw AppError.forbidden('Cannot modify the company owner via this endpoint', 'FORBIDDEN')
    }

    if (dto.name !== undefined) user.name = dto.name
    if (dto.role !== undefined) user.role = dto.role
    if (dto.customRoleId !== undefined) user.customRoleId = dto.customRoleId as any
    if (dto.isActive !== undefined) user.isActive = dto.isActive

    await user.save()

    if (dto.isActive === false) {
      await RefreshSessionModel.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() })
    }

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'user.updated',
      message: `User ${user.name} updated`,
      entity: `user:${idOf(user)}`,
    })

    return this.serialize(user)
  }

  async delete(companyId: string, actor: { id: string; name?: string }, userId: string) {
    const user = await UserModel.findOne({ _id: userId, companyId })
    if (!user) {
      throw AppError.notFound('User not found', 'NOT_FOUND')
    }

    if (user.role === 'owner') {
      throw AppError.forbidden('Cannot modify the company owner via this endpoint', 'FORBIDDEN')
    }

    user.isActive = false
    await user.save()

    await RefreshSessionModel.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() })

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'user.deactivated',
      message: `User ${user.name} deactivated`,
      entity: `user:${idOf(user)}`,
    })

    return null
  }

  private serialize(user: any) {
    return {
      id: idOf(user),
      name: user.name,
      email: user.email,
      role: user.role,
      customRoleId: user.customRoleId?.toString() ?? null,
      isActive: user.isActive,
      emailVerifiedAt: user.emailVerifiedAt ?? null,
      avatarUrl: user.avatarUrl ?? null,
      createdAt: user.createdAt,
    }
  }
}

export const userService = new UserService()
