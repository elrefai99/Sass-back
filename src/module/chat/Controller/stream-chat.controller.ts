import type { RequestHandler } from 'express'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { chatSseBroker } from '../shared/chat.sse'

export const streamChatController: RequestHandler = asyncHandler(async (req, res) => {
  await chatSseBroker.connect(req, res, req.user!.id, { connectedAt: new Date().toISOString() })
})
