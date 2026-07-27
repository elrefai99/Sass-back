import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { analyticsService } from '../Service/analytics.service'

export const realtimeController: RequestHandler = asyncHandler(async (req, res) => {
  const stats = await analyticsService.realtime(req.user!.companyId)
  sendSuccess(res, 'Realtime analytics fetched successfully', stats)
})
