import { Schema, model, models } from 'mongoose'
import { MESSAGE_TYPES } from '../shared/enums'
import { schemaOptions } from './options'

const attachmentSchema = new Schema(
  {
    url: { type: String, required: true },
    name: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
  },
  { _id: false },
)

const messageSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    senderName: { type: String, default: '' },
    type: { type: String, enum: MESSAGE_TYPES, default: 'text' },
    body: { type: String, default: '', trim: true },
    attachments: { type: [attachmentSchema], default: [] },
    editedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  schemaOptions,
)

messageSchema.index({ conversationId: 1, createdAt: -1 })

export const MessageModel = models.Message || model('Message', messageSchema)
