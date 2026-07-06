import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { chatService } from '../Service/chat.service'

export const listConversationsController: RequestHandler = asyncHandler(async (req, res) => {
  const result = await chatService.listConversations(req.user!.companyId, req.user!.id, req.validatedQuery)
  sendSuccess(res, 'Conversations fetched successfully', result.data)
})
