import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { profileService } from '../Service/profile.service'

export const updateProfileController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await profileService.updateProfile(req.user!.id, req.user!.companyId, req.body)
  sendSuccess(res, 'Profile updated successfully', data)
})
