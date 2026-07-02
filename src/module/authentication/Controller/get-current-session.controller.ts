import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { authenticationService } from '../Service/auth.service'

export const getCurrentSessionController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await authenticationService.me(req.user!.id)
  sendSuccess(res, 'Session fetched successfully', data)
})
