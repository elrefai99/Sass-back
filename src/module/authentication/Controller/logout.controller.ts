import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { authenticationService } from '../Service/auth.service'

export const logoutController: RequestHandler = asyncHandler(async (req, res) => {
  await authenticationService.logout(req.body)
  sendSuccess(res, 'Logged out', null)
})
