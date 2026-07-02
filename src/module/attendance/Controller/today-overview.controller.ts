import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { attendanceService } from '../Service/attendance.service'

export const todayOverviewController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await attendanceService.today(req.user!.companyId, req.user!)
  sendSuccess(res, 'Attendance overview fetched successfully', data)
})
