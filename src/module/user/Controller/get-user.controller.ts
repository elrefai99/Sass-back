import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { userService } from '../Service/user.service'

export const getUserController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await userService.get(req.user!.companyId, String(req.params.id))
  sendSuccess(res, 'User fetched successfully', data)
})
