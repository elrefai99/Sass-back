import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { chatService } from '../Service/chat.service'

export const updateConversationController: RequestHandler = asyncHandler(async (req, res) => {
  const conversation = await chatService.updateConversation(
    req.user!.companyId,
    { id: req.user!.id, name: req.user!.name },
    String(req.params.id),
    req.body,
  )
  sendSuccess(res, 'Conversation updated successfully', conversation)
})
