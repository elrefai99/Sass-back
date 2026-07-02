import { Schema, model, models } from 'mongoose'
import { PROJECT_STATUSES } from '../shared/enums'
import { schemaOptions } from './options'

const projectSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: PROJECT_STATUSES, default: 'planning' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', default: null },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
    startDate: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  schemaOptions,
)

projectSchema.index({ companyId: 1, status: 1 })
projectSchema.index({ companyId: 1, name: 1 })

export const ProjectModel = models.Project || model('Project', projectSchema)
