import { Schema, model, models } from 'mongoose'
import { schemaOptions } from './options'

const roleSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, default: '' },
    isSystem: { type: Boolean, default: false },
    permissionKeys: { type: [String], default: [] },
  },
  schemaOptions,
)

roleSchema.index({ companyId: 1, key: 1 }, { unique: true })

export const RoleModel = models.Role || model('Role', roleSchema)
