import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { taskService } from '../Service/task.service'

export const listTasksController: RequestHandler = asyncHandler(async (req, res) => {
  const result = await taskService.list(req.user!.companyId, req.validatedQuery)
  sendSuccess(res, 'Tasks fetched successfully', result.data, 200, result.meta)
})
