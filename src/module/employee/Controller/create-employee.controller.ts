import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { employeeService } from '../Service/employee.service'

export const createEmployeeController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await employeeService.create(req.user!.companyId, req.user!, req.body)
  sendSuccess(res, 'Employee created successfully', data, 201)
})
