import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { requireRole } from '../../middleware/require-role'
import { validateDTO } from '../../middleware/validateDTO'
import { upgradePlanSchema } from './DTO/index.dto'
import { getSubscriptionController, listPlansController, upgradePlanController } from './subscription.controller'

const router: ExpressRouter = Router()

router.use(auth)
/**
 * @openapi
 * /api/v1/subscription/plans:
 *   get:
 *     tags: [Subscription]
 *     summary: List available subscription plans
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
router.get('/plans', listPlansController)
/**
 * @openapi
 * /api/v1/subscription:
 *   get:
 *     tags: [Subscription]
 *     summary: Get the current organization's subscription (admin only)
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
router.get('/', requireRole('admin'), getSubscriptionController)
/**
 * @openapi
 * /api/v1/subscription/upgrade:
 *   post:
 *     tags: [Subscription]
 *     summary: Upgrade the current subscription plan (owner only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan: { type: string, example: pro }
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
router.post('/upgrade', requireRole('owner'), validateDTO({ body: upgradePlanSchema }), upgradePlanController)

export default router
