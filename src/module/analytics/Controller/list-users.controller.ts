import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { analyticsService } from '../Service/analytics.service'

export const listUsersController: RequestHandler = asyncHandler(async (req, res) => {
  const result = await analyticsService.users(req.user!.companyId, req.validatedQuery)
  sendSuccess(res, 'User activity fetched successfully', result.data, 200, result.meta)
})
