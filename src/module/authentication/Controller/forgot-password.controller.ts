import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { authenticationService } from '../Service/auth.service'

export const forgotPasswordController: RequestHandler = asyncHandler(async (req, res) => {
  await authenticationService.forgotPassword(req.body)
  sendSuccess(res, 'If an account exists, a reset link has been sent', null)
})
