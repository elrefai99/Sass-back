import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { validateDTO } from '../../middleware/validateDTO'
import { listNotificationsQuerySchema, notificationParamsSchema } from './DTO/index.dto'
import {
  listNotificationsController,
  markAllReadController,
  markOneReadController,
  streamNotificationsController,
} from './notification.controller'

const router: ExpressRouter = Router()

router.use(auth)
router.get('/stream', streamNotificationsController)
router.get('/', validateDTO({ query: listNotificationsQuerySchema }), listNotificationsController)
router.patch('/read-all', markAllReadController)
router.patch('/:id/read', validateDTO({ params: notificationParamsSchema }), markOneReadController)

export default router
