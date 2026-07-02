import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { taskService } from '../Service/task.service'

export const deleteTaskController: RequestHandler = asyncHandler(async (req, res) => {
  await taskService.delete(req.user!.companyId, req.user!, String(req.params.id))
  sendSuccess(res, 'Task deleted successfully', null)
})
