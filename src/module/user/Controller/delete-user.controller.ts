import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { userService } from '../Service/user.service'

export const deleteUserController: RequestHandler = asyncHandler(async (req, res) => {
  await userService.delete(req.user!.companyId, req.user!, String(req.params.id))
  sendSuccess(res, 'User deactivated successfully', null)
})
