import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { userService } from '../Service/user.service'

export const listUsersController: RequestHandler = asyncHandler(async (req, res) => {
  const result = await userService.list(req.user!.companyId, req.query as any)
  sendSuccess(res, 'Users fetched successfully', result.data, 200, result.meta)
})
