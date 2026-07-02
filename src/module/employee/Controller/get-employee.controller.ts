import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { employeeService } from '../Service/employee.service'

export const getEmployeeController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await employeeService.get(req.user!.companyId, req.user!.role, String(req.params.id))
  sendSuccess(res, 'Employee fetched successfully', data)
})
