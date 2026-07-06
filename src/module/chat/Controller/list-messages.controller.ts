import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { chatService } from '../Service/chat.service'

export const listMessagesController: RequestHandler = asyncHandler(async (req, res) => {
  const result = await chatService.listMessages(
    req.user!.companyId,
    req.user!.id,
    String(req.params.id),
    req.validatedQuery,
  )
  sendSuccess(res, 'Messages fetched successfully', result.data, 200, result.meta as never)
})
