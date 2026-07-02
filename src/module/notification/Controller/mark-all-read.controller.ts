import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { notificationService } from '../Service/notification.service'

export const markAllReadController: RequestHandler = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user!.id)
  sendSuccess(res, 'Notifications marked as read', null)
})
