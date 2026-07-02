import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { validateDTO } from '../../middleware/validateDTO'
import {
  addCommentSchema,
  listCommentsQuerySchema,
  taskCommentParamsSchema,
  taskCommentTaskParamsSchema,
} from './DTO/index.dto'
import { addCommentController, deleteCommentController, listCommentsController } from './task-comment.controller'

const router: ExpressRouter = Router({ mergeParams: true })

router.use(auth)

/**
 * @openapi
 * /api/v1/tasks/{taskId}/comments:
 *   get:
 *     tags: [Task Comments]
 *     summary: List comments for a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer }
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
router.get('/', validateDTO({ params: taskCommentTaskParamsSchema, query: listCommentsQuerySchema }), listCommentsController)

/**
 * @openapi
 * /api/v1/tasks/{taskId}/comments:
 *   post:
 *     tags: [Task Comments]
 *     summary: Add a comment to a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
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
 *     responses:
 *       201:
 *         description: Created
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
router.post('/', validateDTO({ params: taskCommentTaskParamsSchema, body: addCommentSchema }), addCommentController)

/**
 * @openapi
 * /api/v1/tasks/{taskId}/comments/{commentId}:
 *   delete:
 *     tags: [Task Comments]
 *     summary: Delete a comment from a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: commentId
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
router.delete('/:commentId', validateDTO({ params: taskCommentParamsSchema }), deleteCommentController)

export default router
