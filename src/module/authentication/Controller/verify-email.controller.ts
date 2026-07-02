import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { authenticationService } from '../Service/auth.service'

export const verifyEmailController: RequestHandler = asyncHandler(async (req, res) => {
  await authenticationService.verifyEmail(req.body)
  sendSuccess(res, 'Email verified successfully', null)
})
