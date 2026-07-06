import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { chatService } from '../Service/chat.service'

export const removeMemberController: RequestHandler = asyncHandler(async (req, res) => {
  await chatService.removeMember(
    req.user!.companyId,
    { id: req.user!.id, name: req.user!.name },
    String(req.params.id),
    String(req.params.userId),
  )
  sendSuccess(res, 'Member removed successfully')
})
