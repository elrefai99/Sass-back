import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { chatService } from '../Service/chat.service'

export const getConversationController: RequestHandler = asyncHandler(async (req, res) => {
  const conversation = await chatService.getConversation(req.user!.companyId, req.user!.id, String(req.params.id))
  sendSuccess(res, 'Conversation fetched successfully', conversation)
})
