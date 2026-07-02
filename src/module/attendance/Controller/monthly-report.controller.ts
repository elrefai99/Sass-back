import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { attendanceService } from '../Service/attendance.service'

export const monthlyReportController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await attendanceService.monthlyReport(req.user!.companyId, req.user!, req.query as any)
  sendSuccess(res, 'Monthly attendance report fetched successfully', data)
})
