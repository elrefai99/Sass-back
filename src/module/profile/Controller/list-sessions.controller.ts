import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { profileService } from '../Service/profile.service'

export const listSessionsController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await profileService.listSessions(req.user!.id)
  sendSuccess(res, 'Sessions fetched successfully', data)
})
