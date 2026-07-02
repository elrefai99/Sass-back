import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { departmentService } from '../Service/department.service'

export const createDepartmentController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await departmentService.create(req.user!.companyId, req.user!, req.body)
  sendSuccess(res, 'Department created successfully', data, 201)
})
