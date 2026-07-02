import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { taskCommentService } from '../Service/task-comment.service'

export const listCommentsController: RequestHandler = asyncHandler(async (req, res) => {
  const result = await taskCommentService.list(req.user!.companyId, String(req.params.taskId), req.query as any)
  sendSuccess(res, 'Comments fetched successfully', result.data, 200, result.meta)
})
