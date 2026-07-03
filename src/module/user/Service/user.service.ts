import { RefreshSessionModel, RoleModel, UserModel } from '../../../schema'
import { idOf } from '../../../shared/document'
import { writeActivity } from '../../../shared/activity'
import { buildMeta, parsePagination } from '../../../shared/pagination'
import { buildSearchFilter } from '../../../shared/filter'
import { assertCanActOnUserRole, assertCanAssignRole } from '../../../shared/authz'
import type { SystemRole } from '../../../shared/enums'
import { AppError } from '../../../utils/errors/app-error'
import type { ListUsersQueryDTO, UpdateUserDTO } from '../DTO/index.dto'

type UserActor = { id: string; name?: string; role: SystemRole }

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

  async update(companyId: string, actor: UserActor, userId: string, dto: UpdateUserDTO) {
    const user = await UserModel.findOne({ _id: userId, companyId })
    if (!user) {
      throw AppError.notFound('User not found', 'NOT_FOUND')
    }

    // Actors may only act on users strictly below their own rank (blocks an
    // admin from modifying a peer admin or the owner).
    assertCanActOnUserRole(actor.role, user.role)

    // A new role may not be at or above the actor's own level.
    if (dto.role !== undefined) {
      assertCanAssignRole(actor.role, dto.role)
    }

    // A custom role must belong to this company (blocks cross-tenant role reuse).
    if (dto.customRoleId) {
      const roleExists = await RoleModel.exists({ _id: dto.customRoleId, companyId })
      if (!roleExists) {
        throw AppError.notFound('Role not found', 'NOT_FOUND')
      }
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

  async delete(companyId: string, actor: UserActor, userId: string) {
    const user = await UserModel.findOne({ _id: userId, companyId })
    if (!user) {
      throw AppError.notFound('User not found', 'NOT_FOUND')
    }

    // Actors may only deactivate users strictly below their own rank.
    assertCanActOnUserRole(actor.role, user.role)

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
