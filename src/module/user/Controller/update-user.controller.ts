import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { userService } from '../Service/user.service'

export const updateUserController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await userService.update(req.user!.companyId, req.user!, String(req.params.id), req.body)
  sendSuccess(res, 'User updated successfully', data)
})
