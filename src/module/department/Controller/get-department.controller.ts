import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { departmentService } from '../Service/department.service'

export const getDepartmentController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await departmentService.get(req.user!.companyId, String(req.params.id))
  sendSuccess(res, 'Department fetched successfully', data)
})
