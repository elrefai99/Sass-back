import { Schema, model, models } from 'mongoose'
import { TASK_PRIORITIES, TASK_STATUSES } from '../shared/enums'
import { schemaOptions } from './options'

const taskSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', default: null, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: TASK_STATUSES, default: 'todo' },
    priority: { type: String, enum: TASK_PRIORITIES, default: 'medium' },
    dueDate: { type: Date, default: null },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null, index: true },
    order: { type: Number, default: 0 },
  },
  schemaOptions,
)

taskSchema.index({ companyId: 1, status: 1, order: 1 })
taskSchema.index({ companyId: 1, assigneeId: 1 })
taskSchema.index({ companyId: 1, dueDate: 1 })

export const TaskModel = models.Task || model('Task', taskSchema)
