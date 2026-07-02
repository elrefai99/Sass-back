import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { attendanceService } from '../Service/attendance.service'

export const checkOutController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await attendanceService.checkOut(req.user!.companyId, req.user!)
  sendSuccess(res, 'Checked out successfully', data)
})
