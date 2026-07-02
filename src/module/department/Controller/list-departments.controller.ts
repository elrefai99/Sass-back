import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { departmentService } from '../Service/department.service'

export const listDepartmentsController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await departmentService.list(req.user!.companyId, req.validatedQuery)
  sendSuccess(res, 'Departments fetched successfully', data)
})
