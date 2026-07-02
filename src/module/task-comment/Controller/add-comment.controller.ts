import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { taskCommentService } from '../Service/task-comment.service'

export const addCommentController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await taskCommentService.add(req.user!.companyId, req.user!, String(req.params.taskId), req.body)
  sendSuccess(res, 'Comment added successfully', data, 201)
})
