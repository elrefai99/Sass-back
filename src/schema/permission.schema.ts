import { Schema, model, models } from 'mongoose'
import { schemaOptions } from './options'

const permissionSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    key: { type: String, required: true, trim: true, lowercase: true },
    label: { type: String, required: true, trim: true },
    group: { type: String, required: true, trim: true },
  },
  schemaOptions,
)

permissionSchema.index({ companyId: 1, key: 1 }, { unique: true })

export const PermissionModel = models.Permission || model('Permission', permissionSchema)
