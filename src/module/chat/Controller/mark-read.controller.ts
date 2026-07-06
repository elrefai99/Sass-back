import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { chatService } from '../Service/chat.service'

export const markReadController: RequestHandler = asyncHandler(async (req, res) => {
  const result = await chatService.markRead(req.user!.companyId, req.user!.id, String(req.params.id))
  sendSuccess(res, 'Conversation marked as read', result)
})
