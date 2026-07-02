import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { employeeService } from '../Service/employee.service'

export const listEmployeesController: RequestHandler = asyncHandler(async (req, res) => {
  const result = await employeeService.list(req.user!.companyId, req.user!.role, req.query as any)
  sendSuccess(res, 'Employees fetched successfully', result.data, 200, result.meta)
})
