import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { chatService } from '../Service/chat.service'

export const listContactsController: RequestHandler = asyncHandler(async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined
  const contacts = await chatService.listContacts(req.user!.companyId, req.user!.id, search)
  sendSuccess(res, 'Contacts fetched successfully', contacts)
})
