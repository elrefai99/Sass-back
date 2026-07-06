import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { validateDTO } from '../../middleware/validateDTO'
import {
  addMembersSchema,
  conversationMemberParamsSchema,
  conversationParamsSchema,
  createConversationSchema,
  listConversationsQuerySchema,
  listMessagesQuerySchema,
  sendMessageSchema,
  typingSchema,
  updateConversationSchema,
} from './DTO/index.dto'
import {
  addMembersController,
  createConversationController,
  getConversationController,
  listContactsController,
  listConversationsController,
  listMessagesController,
  markReadController,
  removeMemberController,
  sendMessageController,
  streamChatController,
  typingController,
  updateConversationController,
} from './chat.controller'

const router: ExpressRouter = Router()

router.use(auth)

/**
 * @openapi
 * /api/v1/chat/stream:
 *   get:
 *     tags: [Chat]
 *     summary: Server-Sent Events stream of live chat events
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A stream of Server-Sent Events (message.created, conversation.updated, message.read, typing)
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 */
router.get('/stream', streamChatController)

/**
 * @openapi
 * /api/v1/chat/contacts:
 *   get:
 *     tags: [Chat]
 *     summary: List people in the company available to chat with
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 */
router.get('/contacts', listContactsController)

/**
 * @openapi
 * /api/v1/chat/conversations:
 *   get:
 *     tags: [Chat]
 *     summary: List the current user's conversations (DMs and groups)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *   post:
 *     tags: [Chat]
 *     summary: Open a DM or create a group conversation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [type, userId]
 *                 properties:
 *                   type: { type: string, enum: [dm] }
 *                   userId: { type: string }
 *               - type: object
 *                 required: [type, name, memberIds]
 *                 properties:
 *                   type: { type: string, enum: [group] }
 *                   name: { type: string }
 *                   avatarUrl: { type: string }
 *                   memberIds: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Conversation ready
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 */
router.get('/conversations', validateDTO({ query: listConversationsQuerySchema }), listConversationsController)
router.post('/conversations', validateDTO({ body: createConversationSchema }), createConversationController)

/**
 * @openapi
 * /api/v1/chat/conversations/{id}:
 *   get:
 *     tags: [Chat]
 *     summary: Get a conversation by id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Success, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 *   patch:
 *     tags: [Chat]
 *     summary: Rename or update a group conversation (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Success, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 */
router.get('/conversations/:id', validateDTO({ params: conversationParamsSchema }), getConversationController)
router.patch(
  '/conversations/:id',
  validateDTO({ params: conversationParamsSchema, body: updateConversationSchema }),
  updateConversationController,
)

/**
 * @openapi
 * /api/v1/chat/conversations/{id}/read:
 *   patch:
 *     tags: [Chat]
 *     summary: Mark a conversation as read up to now
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Success, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 */
router.patch('/conversations/:id/read', validateDTO({ params: conversationParamsSchema }), markReadController)

/**
 * @openapi
 * /api/v1/chat/conversations/{id}/typing:
 *   post:
 *     tags: [Chat]
 *     summary: Broadcast a typing indicator to the other participants
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Success, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 */
router.post(
  '/conversations/:id/typing',
  validateDTO({ params: conversationParamsSchema, body: typingSchema }),
  typingController,
)

/**
 * @openapi
 * /api/v1/chat/conversations/{id}/members:
 *   post:
 *     tags: [Chat]
 *     summary: Add members to a group conversation (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Success, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 */
router.post(
  '/conversations/:id/members',
  validateDTO({ params: conversationParamsSchema, body: addMembersSchema }),
  addMembersController,
)

/**
 * @openapi
 * /api/v1/chat/conversations/{id}/members/{userId}:
 *   delete:
 *     tags: [Chat]
 *     summary: Remove a member from a group (admin), or leave the group (self)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Success, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 */
router.delete(
  '/conversations/:id/members/:userId',
  validateDTO({ params: conversationMemberParamsSchema }),
  removeMemberController,
)

/**
 * @openapi
 * /api/v1/chat/conversations/{id}/messages:
 *   get:
 *     tags: [Chat]
 *     summary: List messages in a conversation (newest-first cursor via `before`)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 30 }
 *       - in: query
 *         name: before
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200: { description: Success, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 *   post:
 *     tags: [Chat]
 *     summary: Send a message to a conversation
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               body: { type: string }
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url: { type: string }
 *                     name: { type: string }
 *                     mimeType: { type: string }
 *                     size: { type: integer }
 *     responses:
 *       201: { description: Message sent, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 */
router.get(
  '/conversations/:id/messages',
  validateDTO({ params: conversationParamsSchema, query: listMessagesQuerySchema }),
  listMessagesController,
)
router.post(
  '/conversations/:id/messages',
  validateDTO({ params: conversationParamsSchema, body: sendMessageSchema }),
  sendMessageController,
)

export default router
