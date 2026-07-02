import { Schema, model, models } from 'mongoose'
import { schemaOptions } from './options'

const departmentSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    color: { type: String, default: '#6e79f4' },
    isDefault: { type: Boolean, default: false },
  },
  schemaOptions,
)

departmentSchema.index({ companyId: 1, name: 1 }, { unique: true })

export const DepartmentModel = models.Department || model('Department', departmentSchema)
