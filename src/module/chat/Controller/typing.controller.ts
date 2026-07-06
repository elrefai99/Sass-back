import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { chatService } from '../Service/chat.service'

export const typingController: RequestHandler = asyncHandler(async (req, res) => {
  await chatService.typing(
    req.user!.companyId,
    { id: req.user!.id, name: req.user!.name },
    String(req.params.id),
    req.body?.typing ?? true,
  )
  sendSuccess(res, 'Typing signal sent')
})
