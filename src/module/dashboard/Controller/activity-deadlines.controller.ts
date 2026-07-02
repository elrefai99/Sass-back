import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { dashboardService } from '../Service/dashboard.service'

export const activityDeadlinesController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await dashboardService.activity(req.user!.companyId, req.query as any)
  sendSuccess(res, 'Dashboard activity fetched successfully', data)
})
