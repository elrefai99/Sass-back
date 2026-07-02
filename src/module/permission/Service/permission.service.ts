import { PermissionModel } from '../../../schema'
import { idOf } from '../../../shared/document'
import { PERMISSION_CATALOG } from '../utils/catalog'

export class PermissionService {
  async ensureCatalog(companyId: string) {
    const count = await PermissionModel.countDocuments({ companyId })
    if (count >= PERMISSION_CATALOG.length) return

    await PermissionModel.bulkWrite(
      PERMISSION_CATALOG.map((entry) => ({
        updateOne: {
          filter: { companyId, key: entry.key },
          update: { $setOnInsert: { companyId, ...entry } },
          upsert: true,
        },
      })),
    )
  }

  async list(companyId: string) {
    await this.ensureCatalog(companyId)
    const permissions = await PermissionModel.find({ companyId }).sort({ group: 1, key: 1 })
    return permissions.map((permission) => this.serialize(permission))
  }

  private serialize(permission: any) {
    return {
      id: idOf(permission),
      key: permission.key,
      label: permission.label,
      group: permission.group,
    }
  }
}

export const permissionService = new PermissionService()
