import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { requireRole } from '../../middleware/require-role'
import { validateDTO } from '../../middleware/validateDTO'
import { completeOnboardingSchema, inviteEmployeesSchema } from './DTO/index.dto'
import { completeOnboardingController, inviteEmployeesController } from './onboarding.controller'

export const onboardingRouter: ExpressRouter = Router()
onboardingRouter.use(auth)
/**
 * @openapi
 * /api/v1/company/onboarding/complete:
 *   post:
 *     tags: [Onboarding]
 *     summary: Complete company onboarding (owner only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               extraDepartments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name: { type: string, example: Marketing }
 *                     description: { type: string }
 *               invitations:
 *                 type: array
 *                 items: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Onboarding completed
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
onboardingRouter.post(
  '/complete',
  requireRole('owner'),
  validateDTO({ body: completeOnboardingSchema }),
  completeOnboardingController,
)

export const invitationsRouter: ExpressRouter = Router()
invitationsRouter.use(auth)
/**
 * @openapi
 * /api/v1/invitations:
 *   post:
 *     tags: [Invitations]
 *     summary: Invite employees to the company by email (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emails:
 *                 type: array
 *                 items: { type: string, format: email }
 *               role: { type: string, example: employee }
 *     responses:
 *       201:
 *         description: Invitations sent
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
invitationsRouter.post(
  '/',
  requireRole('admin'),
  validateDTO({ body: inviteEmployeesSchema }),
  inviteEmployeesController,
)

export default onboardingRouter
