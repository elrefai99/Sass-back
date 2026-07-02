import { RoleModel, UserModel } from '../../../schema'
import { idOf } from '../../../shared/document'
import { buildSearchFilter } from '../../../shared/filter'
import { writeActivity } from '../../../shared/activity'
import { SYSTEM_ROLES } from '../../../shared/enums'
import { AppError } from '../../../utils/errors/app-error'
import { SYSTEM_ROLE_DEFAULT_PERMISSIONS } from '../../permission/utils/catalog'
import type { CreateRoleDTO, ListRolesQueryDTO, UpdateRoleDTO } from '../DTO/index.dto'

export class RoleService {
  async ensureSystemRoles(companyId: string) {
    const count = await RoleModel.countDocuments({ companyId, isSystem: true })
    if (count >= SYSTEM_ROLES.length) return

    await RoleModel.bulkWrite(
      SYSTEM_ROLES.map((role) => ({
        updateOne: {
          filter: { companyId, key: role },
          update: {
            $setOnInsert: {
              companyId,
              key: role,
              name: role.charAt(0).toUpperCase() + role.slice(1),
              description: `System role: ${role}`,
              isSystem: true,
              permissionKeys: SYSTEM_ROLE_DEFAULT_PERMISSIONS[role],
            },
          },
          upsert: true,
        },
      })),
    )
  }

  async list(companyId: string, query: ListRolesQueryDTO) {
    await this.ensureSystemRoles(companyId)
    const filter: Record<string, unknown> = { companyId, ...buildSearchFilter(query.search, ['name', 'key']) }
    const roles = await RoleModel.find(filter).sort({ isSystem: -1, name: 1 })
    return roles.map((role) => this.serialize(role))
  }

  async get(companyId: string, roleId: string) {
    const role = await RoleModel.findOne({ _id: roleId, companyId })
    if (!role) {
      throw AppError.notFound('Role not found', 'NOT_FOUND')
    }
    return this.serialize(role)
  }

  async create(companyId: string, actor: { id: string; name?: string }, dto: CreateRoleDTO) {
    const key = dto.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const role = await RoleModel.create({
      companyId,
      name: dto.name,
      key,
      description: dto.description ?? '',
      isSystem: false,
      permissionKeys: dto.permissionKeys ?? [],
    })

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'role.created',
      message: `Role ${role.name} created`,
      entity: `role:${idOf(role)}`,
    })

    return this.serialize(role)
  }

  async update(companyId: string, actor: { id: string; name?: string }, roleId: string, dto: UpdateRoleDTO) {
    const role = await RoleModel.findOne({ _id: roleId, companyId })
    if (!role) {
      throw AppError.notFound('Role not found', 'NOT_FOUND')
    }
    if (role.isSystem && dto.name) {
      throw AppError.forbidden('System roles cannot be renamed', 'FORBIDDEN')
    }

    if (dto.name) role.name = dto.name
    if (dto.description !== undefined) role.description = dto.description
    if (dto.permissionKeys) role.permissionKeys = dto.permissionKeys
    await role.save()

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'role.updated',
      message: `Role ${role.name} updated`,
      entity: `role:${idOf(role)}`,
    })

    return this.serialize(role)
  }

  async delete(companyId: string, actor: { id: string; name?: string }, roleId: string) {
    const role = await RoleModel.findOne({ _id: roleId, companyId })
    if (!role) {
      throw AppError.notFound('Role not found', 'NOT_FOUND')
    }
    if (role.isSystem) {
      throw AppError.forbidden('System roles cannot be deleted', 'FORBIDDEN')
    }

    const assignedUsers = await UserModel.countDocuments({ companyId, customRoleId: roleId })
    if (assignedUsers > 0) {
      throw AppError.conflict(`Role is assigned to ${assignedUsers} user(s)`, 'CONFLICT')
    }

    await role.deleteOne()
    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'role.deleted',
      message: `Role ${role.name} deleted`,
      entity: `role:${roleId}`,
    })

    return null
  }

  private serialize(role: any) {
    return {
      id: idOf(role),
      name: role.name,
      key: role.key,
      description: role.description,
      isSystem: role.isSystem,
      permissionKeys: role.permissionKeys,
      createdAt: role.createdAt,
    }
  }
}

export const roleService = new RoleService()
