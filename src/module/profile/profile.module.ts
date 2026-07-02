import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { validateDTO } from '../../middleware/validateDTO'
import { changePasswordSchema, sessionParamsSchema, updateProfileSchema } from './DTO/index.dto'
import {
  changePasswordController,
  listSessionsController,
  revokeSessionController,
  updateProfileController,
} from './profile.controller'

const router: ExpressRouter = Router()

router.use(auth)
/**
 * @openapi
 * /api/v1/profile:
 *   patch:
 *     tags: [Profile]
 *     summary: Update the current user's profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: Jane Doe }
 *               avatarUrl: { type: string, nullable: true, example: 'https://example.com/avatar.png' }
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
router.patch('/', validateDTO({ body: updateProfileSchema }), updateProfileController)
/**
 * @openapi
 * /api/v1/profile/password:
 *   patch:
 *     tags: [Profile]
 *     summary: Change the current user's password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword: { type: string, format: password }
 *               newPassword: { type: string, format: password }
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
router.patch('/password', validateDTO({ body: changePasswordSchema }), changePasswordController)
/**
 * @openapi
 * /api/v1/profile/sessions:
 *   get:
 *     tags: [Profile]
 *     summary: List the current user's active sessions
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
router.get('/sessions', listSessionsController)
/**
 * @openapi
 * /api/v1/profile/sessions/{id}:
 *   delete:
 *     tags: [Profile]
 *     summary: Revoke a session by id
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
router.delete('/sessions/:id', validateDTO({ params: sessionParamsSchema }), revokeSessionController)

export default router
