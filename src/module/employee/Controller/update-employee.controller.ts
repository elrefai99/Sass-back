import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { employeeService } from '../Service/employee.service'

export const updateEmployeeController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await employeeService.update(req.user!.companyId, req.user!, String(req.params.id), req.body)
  sendSuccess(res, 'Employee updated successfully', data)
})
