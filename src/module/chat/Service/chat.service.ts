import { ConversationModel, MessageModel, UserModel } from '../../../schema'
import { idOf } from '../../../shared/document'
import { buildSearchFilter } from '../../../shared/filter'
import { notifyUser } from '../../../shared/notify'
import { publishChatEvent, type ChatEventPayload } from '../../../shared/chat-events'
import { AppError } from '../../../utils/errors/app-error'
import { logger } from '../../../utils/logger'
import { chatSseBroker } from '../shared/chat.sse'
import type {
  AddMembersDTO,
  CreateConversationDTO,
  ListConversationsQueryDTO,
  ListMessagesQueryDTO,
  SendMessageDTO,
  UpdateConversationDTO,
} from '../DTO/index.dto'

type Actor = { id: string; name?: string }

type UserLite = { id: string; name: string; avatarUrl: string | null; email: string; role: string }

export class ChatService {
  /* ------------------------------- Conversations ------------------------------ */

  async listConversations(companyId: string, userId: string, query: ListConversationsQueryDTO) {
    const conversations = await ConversationModel.find({
      companyId,
      'members.userId': userId,
    }).sort({ lastMessageAt: -1, updatedAt: -1 })

    const userMap = await this.loadUsers(companyId, this.collectMemberIds(conversations))

    const views = await Promise.all(
      conversations.map((conversation) => this.serializeConversation(conversation, userId, userMap)),
    )

    const search = query.search?.toLowerCase()
    const filtered = search
      ? views.filter((view) => view.title.toLowerCase().includes(search))
      : views

    return { data: filtered }
  }

  async getConversation(companyId: string, userId: string, conversationId: string) {
    const conversation = await this.requireConversation(companyId, userId, conversationId)
    const userMap = await this.loadUsers(companyId, this.collectMemberIds([conversation]))
    return this.serializeConversation(conversation, userId, userMap)
  }

  async createConversation(companyId: string, actor: Actor, dto: CreateConversationDTO) {
    if (dto.type === 'dm') {
      return this.createDm(companyId, actor, dto.userId)
    }
    return this.createGroup(companyId, actor, dto)
  }

  private async createDm(companyId: string, actor: Actor, otherUserId: string) {
    if (otherUserId === actor.id) {
      throw AppError.badRequest('You cannot start a conversation with yourself', 'INVALID_MEMBER')
    }

    const other = await UserModel.findOne({ _id: otherUserId, companyId, isActive: true }).select('_id')
    if (!other) {
      throw AppError.notFound('User not found', 'NOT_FOUND')
    }

    const dmKey = [actor.id, otherUserId].sort().join(':')

    const existing = await ConversationModel.findOne({ companyId, dmKey })
    if (existing) {
      const userMap = await this.loadUsers(companyId, this.collectMemberIds([existing]))
      return this.serializeConversation(existing, actor.id, userMap)
    }

    const conversation = await ConversationModel.create({
      companyId,
      type: 'dm',
      createdBy: actor.id,
      dmKey,
      members: [
        { userId: actor.id, role: 'member', lastReadAt: new Date() },
        { userId: otherUserId, role: 'member', lastReadAt: null },
      ],
    })

    const userMap = await this.loadUsers(companyId, this.collectMemberIds([conversation]))
    await this.emitConversationUpdated(conversation)
    return this.serializeConversation(conversation, actor.id, userMap)
  }

  private async createGroup(companyId: string, actor: Actor, dto: Extract<CreateConversationDTO, { type: 'group' }>) {
    const uniqueMemberIds = [...new Set(dto.memberIds.filter((id) => id !== actor.id))]

    const validCount = await UserModel.countDocuments({
      _id: { $in: uniqueMemberIds },
      companyId,
      isActive: true,
    })
    if (validCount !== uniqueMemberIds.length) {
      throw AppError.badRequest('One or more members are invalid', 'INVALID_MEMBER')
    }

    const conversation = await ConversationModel.create({
      companyId,
      type: 'group',
      name: dto.name,
      avatarUrl: dto.avatarUrl ?? null,
      createdBy: actor.id,
      members: [
        { userId: actor.id, role: 'admin', lastReadAt: new Date() },
        ...uniqueMemberIds.map((userId) => ({ userId, role: 'member' as const, lastReadAt: null })),
      ],
    })

    const userMap = await this.loadUsers(companyId, this.collectMemberIds([conversation]))
    await this.emitConversationUpdated(conversation)
    return this.serializeConversation(conversation, actor.id, userMap)
  }

  async updateConversation(companyId: string, actor: Actor, conversationId: string, dto: UpdateConversationDTO) {
    const conversation = await this.requireConversation(companyId, actor.id, conversationId)
    this.assertGroupAdmin(conversation, actor.id)

    if (dto.name !== undefined) conversation.name = dto.name
    if (dto.avatarUrl !== undefined) conversation.avatarUrl = dto.avatarUrl
    await conversation.save()

    const userMap = await this.loadUsers(companyId, this.collectMemberIds([conversation]))
    await this.emitConversationUpdated(conversation)
    return this.serializeConversation(conversation, actor.id, userMap)
  }

  async addMembers(companyId: string, actor: Actor, conversationId: string, dto: AddMembersDTO) {
    const conversation = await this.requireConversation(companyId, actor.id, conversationId)
    this.assertGroupAdmin(conversation, actor.id)

    const existingIds = new Set(conversation.members.map((m: any) => m.userId.toString()))
    const toAdd = [...new Set(dto.memberIds)].filter((id) => !existingIds.has(id))

    if (toAdd.length === 0) {
      throw AppError.badRequest('All selected users are already members', 'ALREADY_MEMBER')
    }

    const validCount = await UserModel.countDocuments({ _id: { $in: toAdd }, companyId, isActive: true })
    if (validCount !== toAdd.length) {
      throw AppError.badRequest('One or more members are invalid', 'INVALID_MEMBER')
    }

    conversation.members.push(...toAdd.map((userId) => ({ userId, role: 'member', lastReadAt: null })))
    await conversation.save()

    const userMap = await this.loadUsers(companyId, this.collectMemberIds([conversation]))
    await this.emitConversationUpdated(conversation)
    return this.serializeConversation(conversation, actor.id, userMap)
  }

  async removeMember(companyId: string, actor: Actor, conversationId: string, targetUserId: string) {
    const conversation = await this.requireConversation(companyId, actor.id, conversationId)

    if (conversation.type !== 'group') {
      throw AppError.badRequest('Members can only be removed from group conversations', 'NOT_A_GROUP')
    }

    const isSelf = targetUserId === actor.id
    if (!isSelf) {
      this.assertGroupAdmin(conversation, actor.id)
    }

    const before = conversation.members.length
    conversation.members = conversation.members.filter((m: any) => m.userId.toString() !== targetUserId)
    if (conversation.members.length === before) {
      throw AppError.notFound('Member not found in this conversation', 'NOT_FOUND')
    }

    // Keep at least one admin around when possible.
    const hasAdmin = conversation.members.some((m: any) => m.role === 'admin')
    if (!hasAdmin && conversation.members.length > 0) {
      conversation.members[0].role = 'admin'
    }

    await conversation.save()
    await this.emitConversationUpdated(conversation, isSelf ? targetUserId : undefined)

    return null
  }

  /* --------------------------------- Messages -------------------------------- */

  async listMessages(companyId: string, userId: string, conversationId: string, query: ListMessagesQueryDTO) {
    await this.requireConversation(companyId, userId, conversationId)

    const filter: Record<string, unknown> = { conversationId, deletedAt: null }
    if (query.before) filter.createdAt = { $lt: new Date(query.before) }

    const messages = await MessageModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(query.pageSize + 1)

    const hasMore = messages.length > query.pageSize
    const page = hasMore ? messages.slice(0, query.pageSize) : messages
    const ordered = [...page].reverse()

    return {
      data: ordered.map((message) => this.serializeMessage(message)),
      meta: {
        hasMore,
        nextCursor: hasMore ? page[page.length - 1].createdAt.toISOString() : null,
      },
    }
  }

  async sendMessage(companyId: string, actor: Actor, conversationId: string, dto: SendMessageDTO) {
    const conversation = await this.requireConversation(companyId, actor.id, conversationId)
    const senderName = actor.name ?? 'Someone'

    const message = await MessageModel.create({
      companyId,
      conversationId,
      senderId: actor.id,
      senderName,
      type: 'text',
      body: dto.body,
      attachments: dto.attachments,
    })

    const preview = dto.body || (dto.attachments.length ? '📎 Attachment' : '')
    conversation.lastMessage = {
      body: preview,
      senderId: actor.id,
      senderName,
      at: message.createdAt,
    }
    conversation.lastMessageAt = message.createdAt
    // The sender has implicitly read their own message.
    const senderMember = conversation.members.find((m: any) => m.userId.toString() === actor.id)
    if (senderMember) senderMember.lastReadAt = message.createdAt
    await conversation.save()

    const view = this.serializeMessage(message)
    await this.emit({
      event: 'message.created',
      recipientIds: this.memberIds(conversation),
      conversationId,
      data: view,
    })

    await this.notifyRecipients(conversation, actor.id, senderName, preview)

    return view
  }

  async markRead(companyId: string, userId: string, conversationId: string) {
    const conversation = await this.requireConversation(companyId, userId, conversationId)
    const readAt = new Date()

    const member = conversation.members.find((m: any) => m.userId.toString() === userId)
    if (member) member.lastReadAt = readAt
    await conversation.save()

    await this.emit({
      event: 'message.read',
      recipientIds: this.memberIds(conversation),
      conversationId,
      data: { userId, lastReadAt: readAt.toISOString() },
    })

    return { lastReadAt: readAt.toISOString() }
  }

  async typing(companyId: string, actor: Actor, conversationId: string, typing: boolean) {
    const conversation = await this.requireConversation(companyId, actor.id, conversationId)

    await this.emit({
      event: 'typing',
      // Everyone in the room except the person typing.
      recipientIds: this.memberIds(conversation).filter((id) => id !== actor.id),
      conversationId,
      data: { userId: actor.id, userName: actor.name ?? 'Someone', typing },
    })

    return null
  }

  /* --------------------------------- Contacts -------------------------------- */

  async listContacts(companyId: string, userId: string, search?: string) {
    const filter: Record<string, unknown> = {
      companyId,
      isActive: true,
      _id: { $ne: userId },
      ...buildSearchFilter(search, ['name', 'email']),
    }

    const users = await UserModel.find(filter).select('name email avatarUrl role').sort({ name: 1 }).limit(200)

    return users.map((user) => ({
      id: idOf(user),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl ?? null,
      role: user.role,
    }))
  }

  /* --------------------------------- Helpers --------------------------------- */

  private async requireConversation(companyId: string, userId: string, conversationId: string) {
    const conversation = await ConversationModel.findOne({ _id: conversationId, companyId })
    if (!conversation) {
      throw AppError.notFound('Conversation not found', 'NOT_FOUND')
    }
    const isMember = conversation.members.some((m: any) => m.userId.toString() === userId)
    if (!isMember) {
      throw AppError.forbidden('You are not a member of this conversation', 'NOT_A_MEMBER')
    }
    return conversation
  }

  private assertGroupAdmin(conversation: any, userId: string) {
    if (conversation.type !== 'group') {
      throw AppError.badRequest('This action is only available for group conversations', 'NOT_A_GROUP')
    }
    const member = conversation.members.find((m: any) => m.userId.toString() === userId)
    if (!member || member.role !== 'admin') {
      throw AppError.forbidden('Only group admins can perform this action', 'FORBIDDEN')
    }
  }

  private memberIds(conversation: any): string[] {
    return conversation.members.map((m: any) => m.userId.toString())
  }

  private collectMemberIds(conversations: any[]): string[] {
    const ids = new Set<string>()
    for (const conversation of conversations) {
      for (const member of conversation.members) ids.add(member.userId.toString())
    }
    return [...ids]
  }

  private async loadUsers(companyId: string, ids: string[]): Promise<Map<string, UserLite>> {
    if (ids.length === 0) return new Map()
    const users = await UserModel.find({ _id: { $in: ids }, companyId }).select('name email avatarUrl role')
    const map = new Map<string, UserLite>()
    for (const user of users) {
      map.set(idOf(user), {
        id: idOf(user),
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl ?? null,
        role: user.role,
      })
    }
    return map
  }

  private async serializeConversation(conversation: any, userId: string, userMap: Map<string, UserLite>) {
    const myMember = conversation.members.find((m: any) => m.userId.toString() === userId)
    const otherMember =
      conversation.type === 'dm'
        ? conversation.members.find((m: any) => m.userId.toString() !== userId)
        : undefined

    const otherUser = otherMember ? userMap.get(otherMember.userId.toString()) : undefined

    const unreadCount = await MessageModel.countDocuments({
      conversationId: conversation._id,
      senderId: { $ne: userId },
      deletedAt: null,
      ...(myMember?.lastReadAt ? { createdAt: { $gt: myMember.lastReadAt } } : {}),
    })

    const title =
      conversation.type === 'group' ? conversation.name || 'Group' : otherUser?.name ?? 'Unknown user'
    const avatarUrl = conversation.type === 'group' ? conversation.avatarUrl ?? null : otherUser?.avatarUrl ?? null

    return {
      id: idOf(conversation),
      type: conversation.type,
      title,
      avatarUrl,
      createdBy: conversation.createdBy?.toString() ?? null,
      otherUserId: otherMember?.userId?.toString() ?? null,
      myRole: myMember?.role ?? 'member',
      members: conversation.members.map((member: any) => {
        const info = userMap.get(member.userId.toString())
        return {
          userId: member.userId.toString(),
          name: info?.name ?? 'Unknown user',
          avatarUrl: info?.avatarUrl ?? null,
          role: member.role,
          lastReadAt: member.lastReadAt ? new Date(member.lastReadAt).toISOString() : null,
        }
      }),
      lastMessage: conversation.lastMessage
        ? {
            body: conversation.lastMessage.body,
            senderId: conversation.lastMessage.senderId?.toString() ?? null,
            senderName: conversation.lastMessage.senderName,
            at: conversation.lastMessage.at ? new Date(conversation.lastMessage.at).toISOString() : null,
          }
        : null,
      lastMessageAt: conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toISOString() : null,
      unreadCount,
      createdAt: conversation.createdAt?.toISOString?.() ?? new Date().toISOString(),
      updatedAt: conversation.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    }
  }

  private serializeMessage(message: any) {
    return {
      id: idOf(message),
      conversationId: message.conversationId.toString(),
      senderId: message.senderId?.toString() ?? null,
      senderName: message.senderName,
      type: message.type,
      body: message.body,
      attachments: (message.attachments ?? []).map((a: any) => ({
        url: a.url,
        name: a.name ?? '',
        mimeType: a.mimeType ?? '',
        size: a.size ?? 0,
      })),
      editedAt: message.editedAt ? new Date(message.editedAt).toISOString() : null,
      deletedAt: message.deletedAt ? new Date(message.deletedAt).toISOString() : null,
      createdAt: message.createdAt.toISOString(),
    }
  }

  private async emitConversationUpdated(conversation: any, extraRecipientId?: string) {
    const recipientIds = this.memberIds(conversation)
    if (extraRecipientId && !recipientIds.includes(extraRecipientId)) recipientIds.push(extraRecipientId)

    await this.emit({
      event: 'conversation.updated',
      recipientIds,
      conversationId: idOf(conversation),
      data: {
        id: idOf(conversation),
        lastMessage: conversation.lastMessage
          ? {
              body: conversation.lastMessage.body,
              senderId: conversation.lastMessage.senderId?.toString() ?? null,
              senderName: conversation.lastMessage.senderName,
              at: conversation.lastMessage.at ? new Date(conversation.lastMessage.at).toISOString() : null,
            }
          : null,
        lastMessageAt: conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toISOString() : null,
      },
    })
  }

  private async notifyRecipients(conversation: any, senderId: string, senderName: string, preview: string) {
    const title = conversation.type === 'group' ? `${senderName} in ${conversation.name || 'a group'}` : senderName
    const body = preview.length > 140 ? `${preview.slice(0, 140)}…` : preview

    await Promise.all(
      this.memberIds(conversation)
        .filter((id) => id !== senderId)
        .map((userId) =>
          notifyUser({ userId, type: 'chat_message', title, body: body || 'Sent a message' }).catch((error) =>
            logger.error({ error }, 'Failed to notify chat recipient'),
          ),
        ),
    )
  }

  private async emit(event: Omit<ChatEventPayload, 'emittedAt'>) {
    try {
      await publishChatEvent(event)
    } catch (error) {
      logger.error({ error }, 'Failed to publish chat event; delivering to local SSE clients')
      chatSseBroker.emit({ ...event, emittedAt: new Date().toISOString() } as ChatEventPayload)
    }
  }
}

export const chatService = new ChatService()
