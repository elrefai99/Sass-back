import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { authenticationService } from '../Service/auth.service'

export const acceptInvitationController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await authenticationService.acceptInvitation(req.body, {
    ip: req.clientIP,
    userAgent: req.useragent?.source,
  })
  sendSuccess(res, 'Invitation accepted successfully', data, 201)
})
