import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { departmentService } from '../Service/department.service'

export const deleteDepartmentController: RequestHandler = asyncHandler(async (req, res) => {
  await departmentService.delete(req.user!.companyId, req.user!, String(req.params.id))
  sendSuccess(res, 'Department deleted successfully', null)
})
