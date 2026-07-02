import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { onboardingService } from '../Service/onboarding.service'

export const inviteEmployeesController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await onboardingService.inviteEmployees(req.user!.companyId, req.user!, req.body)
  sendSuccess(res, 'Invitations sent', data, 201)
})
