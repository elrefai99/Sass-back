import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { profileService } from '../Service/profile.service'

export const revokeSessionController: RequestHandler = asyncHandler(async (req, res) => {
  await profileService.revokeSession(req.user!.id, String(req.params.id))
  sendSuccess(res, 'Session revoked successfully', null)
})
