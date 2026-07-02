import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { authenticationService } from '../Service/auth.service'

export const resetPasswordController: RequestHandler = asyncHandler(async (req, res) => {
  await authenticationService.resetPassword(req.body)
  sendSuccess(res, 'Password reset successfully', null)
})
