import type { ConversationMemberRole, ConversationType, MessageType } from '../../../shared/enums'

export type ConversationMemberView = {
  userId: string
  name: string
  avatarUrl: string | null
  role: ConversationMemberRole
  lastReadAt: string | null
}

export type ChatMessageView = {
  id: string
  conversationId: string
  senderId: string | null
  senderName: string
  type: MessageType
  body: string
  attachments: { url: string; name: string; mimeType: string; size: number }[]
  editedAt: string | null
  deletedAt: string | null
  createdAt: string
}

export type ConversationView = {
  id: string
  type: ConversationType
  title: string
  avatarUrl: string | null
  createdBy: string | null
  otherUserId: string | null
  myRole: ConversationMemberRole
  members: ConversationMemberView[]
  lastMessage: { body: string; senderId: string | null; senderName: string; at: string | null } | null
  lastMessageAt: string | null
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export type ContactView = {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  role: string
}
