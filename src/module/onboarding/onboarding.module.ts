import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { requireRole } from '../../middleware/require-role'
import { validateDTO } from '../../middleware/validateDTO'
import { completeOnboardingSchema, inviteEmployeesSchema } from './DTO/index.dto'
import { completeOnboardingController, inviteEmployeesController } from './onboarding.controller'

export const onboardingRouter: ExpressRouter = Router()
onboardingRouter.use(auth)
onboardingRouter.post(
  '/complete',
  requireRole('owner'),
  validateDTO({ body: completeOnboardingSchema }),
  completeOnboardingController,
)

export const invitationsRouter: ExpressRouter = Router()
invitationsRouter.use(auth)
invitationsRouter.post(
  '/',
  requireRole('admin'),
  validateDTO({ body: inviteEmployeesSchema }),
  inviteEmployeesController,
)

export default onboardingRouter
