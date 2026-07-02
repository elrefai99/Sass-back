import { Schema, model, models } from 'mongoose'
import { datedOnlySchemaOptions } from './options'

const taskCommentSchema = new Schema(
  {
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  datedOnlySchemaOptions,
)

taskCommentSchema.index({ taskId: 1, createdAt: 1 })
taskCommentSchema.index({ companyId: 1, createdAt: 1 })

export const TaskCommentModel = models.TaskComment || model('TaskComment', taskCommentSchema)
