import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { notificationService } from '../Service/notification.service'

export const listNotificationsController: RequestHandler = asyncHandler(async (req, res) => {
  const result = await notificationService.list(req.user!.id, req.query as any)
  sendSuccess(res, 'Notifications fetched successfully', result.data, 200, result.meta)
})
