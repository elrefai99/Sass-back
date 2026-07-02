import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { departmentService } from '../Service/department.service'

export const updateDepartmentController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await departmentService.update(req.user!.companyId, req.user!, String(req.params.id), req.body)
  sendSuccess(res, 'Department updated successfully', data)
})
