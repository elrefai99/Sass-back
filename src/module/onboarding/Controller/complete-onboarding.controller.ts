import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { onboardingService } from '../Service/onboarding.service'

export const completeOnboardingController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await onboardingService.completeOnboarding(req.user!.companyId, req.user!, req.body)
  sendSuccess(res, 'Onboarding completed', data)
})
