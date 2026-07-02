import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { taskService } from '../Service/task.service'

export const createTaskController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await taskService.create(req.user!.companyId, req.user!, req.body)
  sendSuccess(res, 'Task created successfully', data, 201)
})
