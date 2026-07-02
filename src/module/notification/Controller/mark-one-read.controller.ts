import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { notificationService } from '../Service/notification.service'

export const markOneReadController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await notificationService.markOneRead(req.user!.id, String(req.params.id))
  sendSuccess(res, 'Notification marked as read', data)
})
