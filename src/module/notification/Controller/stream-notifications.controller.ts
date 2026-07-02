import type { RequestHandler } from 'express'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { notificationService } from '../Service/notification.service'
import { notificationSseBroker } from '../shared/notification.sse'

export const streamNotificationsController: RequestHandler = asyncHandler(async (req, res) => {
  const snapshot = await notificationService.streamSnapshot(req.user!.id)
  await notificationSseBroker.connect(req, res, req.user!.id, snapshot)
})
