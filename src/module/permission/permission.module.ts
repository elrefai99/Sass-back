import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { requireRole } from '../../middleware/require-role'
import { listPermissionsController } from './permission.controller'

const router: ExpressRouter = Router()

router.use(auth)
/**
 * @openapi
 * /api/v1/permissions:
 *   get:
 *     tags: [Permissions]
 *     summary: List all available permissions in the catalog (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', requireRole('admin'), listPermissionsController)

export default router
