import { Schema, model, models } from 'mongoose'
import { schemaOptions } from './options'

const teamSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', default: null },
    leadId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    memberIds: { type: [Schema.Types.ObjectId], ref: 'Employee', default: [] },
  },
  schemaOptions,
)

teamSchema.index({ companyId: 1, name: 1 }, { unique: true })

export const TeamModel = models.Team || model('Team', teamSchema)
