import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { taskCommentService } from '../Service/task-comment.service'

export const deleteCommentController: RequestHandler = asyncHandler(async (req, res) => {
  await taskCommentService.delete(
    req.user!.companyId,
    req.user!,
    String(req.params.taskId),
    String(req.params.commentId),
  )
  sendSuccess(res, 'Comment deleted successfully', null)
})
