import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { taskService } from '../Service/task.service'

export const moveTaskController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await taskService.move(req.user!.companyId, req.user!, String(req.params.id), req.body)
  sendSuccess(res, 'Task moved successfully', data)
})
