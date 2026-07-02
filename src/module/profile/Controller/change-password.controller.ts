import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { profileService } from '../Service/profile.service'

export const changePasswordController: RequestHandler = asyncHandler(async (req, res) => {
  await profileService.changePassword(req.user!.id, req.user!.companyId, req.body)
  sendSuccess(res, 'Password changed successfully', null)
})
