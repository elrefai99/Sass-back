import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { validateDTO } from '../../middleware/validateDTO'
import { listNotificationsQuerySchema, notificationParamsSchema } from './DTO/index.dto'
import {
  listNotificationsController,
  markAllReadController,
  markOneReadController,
  streamNotificationsController,
} from './notification.controller'

const router: ExpressRouter = Router()

router.use(auth)
/**
 * @openapi
 * /api/v1/notifications/stream:
 *   get:
 *     tags: [Notifications]
 *     summary: Server-Sent Events stream of live notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A stream of Server-Sent Events, one notification per event
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 */
router.get('/stream', streamNotificationsController)
/**
 * @openapi
 * /api/v1/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List notifications for the current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: read
 *         schema: { type: string, enum: [true, false] }
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', validateDTO({ query: listNotificationsQuerySchema }), listNotificationsController)
/**
 * @openapi
 * /api/v1/notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/read-all', markAllReadController)
/**
 * @openapi
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark a single notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/read', validateDTO({ params: notificationParamsSchema }), markOneReadController)

export default router
