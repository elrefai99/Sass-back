import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { attendanceService } from '../Service/attendance.service'

export const attendanceHistoryController: RequestHandler = asyncHandler(async (req, res) => {
  const result = await attendanceService.history(req.user!.companyId, req.user!, req.validatedQuery)
  sendSuccess(res, 'Attendance history fetched successfully', result.data, 200, result.meta)
})
