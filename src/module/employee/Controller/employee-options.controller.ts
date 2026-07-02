import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { employeeService } from '../Service/employee.service'

export const employeeOptionsController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await employeeService.options(req.user!.companyId)
  sendSuccess(res, 'Employee options fetched successfully', data)
})
