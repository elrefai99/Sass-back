import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { taskService } from '../Service/task.service'

export const getTaskController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await taskService.get(req.user!.companyId, String(req.params.id))
  sendSuccess(res, 'Task fetched successfully', data)
})
