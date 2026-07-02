import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { validateDTO } from '../../middleware/validateDTO'
import { dashboardActivityQuerySchema } from './DTO/index.dto'
import { activityDeadlinesController, chartsController, statsController } from './dashboard.controller'

const router: ExpressRouter = Router()

router.use(auth)
router.get('/stats', statsController)
router.get('/charts', chartsController)
router.get('/activity', validateDTO({ query: dashboardActivityQuerySchema }), activityDeadlinesController)

export default router
