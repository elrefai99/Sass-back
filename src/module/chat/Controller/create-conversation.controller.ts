import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { chatService } from '../Service/chat.service'

export const createConversationController: RequestHandler = asyncHandler(async (req, res) => {
  const conversation = await chatService.createConversation(
    req.user!.companyId,
    { id: req.user!.id, name: req.user!.name },
    req.body,
  )
  sendSuccess(res, 'Conversation ready', conversation, 201)
})
