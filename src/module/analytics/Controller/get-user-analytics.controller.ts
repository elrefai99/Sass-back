import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { analyticsService } from '../Service/analytics.service'
import type { AnalyticsUserParamsDTO } from '../DTO/index.dto'

export const getUserAnalyticsController: RequestHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params as unknown as AnalyticsUserParamsDTO
  const result = await analyticsService.byUser(req.user!.companyId, userId, req.validatedQuery)
  sendSuccess(res, 'User analytics fetched successfully', result.data, 200, result.meta)
})
