import { Schema, model, models } from 'mongoose'
import { CONVERSATION_MEMBER_ROLES, CONVERSATION_TYPES } from '../shared/enums'
import { schemaOptions } from './options'

const conversationMemberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: CONVERSATION_MEMBER_ROLES, default: 'member' },
    joinedAt: { type: Date, default: Date.now },
    lastReadAt: { type: Date, default: null },
  },
  { _id: false },
)

const lastMessageSchema = new Schema(
  {
    body: { type: String, default: '' },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    senderName: { type: String, default: '' },
    at: { type: Date, default: null },
  },
  { _id: false },
)

const conversationSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    type: { type: String, enum: CONVERSATION_TYPES, required: true },
    // Group-only metadata.
    name: { type: String, trim: true, default: '' },
    avatarUrl: { type: String, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    members: { type: [conversationMemberSchema], default: [] },
    lastMessage: { type: lastMessageSchema, default: null },
    lastMessageAt: { type: Date, default: null, index: true },
    // Stable key for a DM pair within a company, guarantees a single 1:1 thread.
    dmKey: { type: String, default: null },
  },
  schemaOptions,
)

conversationSchema.index({ companyId: 1, 'members.userId': 1, lastMessageAt: -1 })
conversationSchema.index({ companyId: 1, dmKey: 1 }, { unique: true, partialFilterExpression: { dmKey: { $type: 'string' } } })

export const ConversationModel = models.Conversation || model('Conversation', conversationSchema)
