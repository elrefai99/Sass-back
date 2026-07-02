import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { validateDTO } from '../../middleware/validateDTO'
import { attendanceHistoryQuerySchema } from './DTO/index.dto'
import {
  attendanceHistoryController,
  checkInController,
  checkOutController,
  todayOverviewController,
} from './attendance.controller'

const router: ExpressRouter = Router()

router.use(auth)
router.get('/today', todayOverviewController)
router.post('/check-in', checkInController)
router.post('/check-out', checkOutController)
router.get('/history', validateDTO({ query: attendanceHistoryQuerySchema }), attendanceHistoryController)

export default router
