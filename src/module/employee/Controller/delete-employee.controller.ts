import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { employeeService } from '../Service/employee.service'

export const deleteEmployeeController: RequestHandler = asyncHandler(async (req, res) => {
  await employeeService.delete(req.user!.companyId, req.user!, String(req.params.id))
  sendSuccess(res, 'Employee deleted successfully', null)
})
