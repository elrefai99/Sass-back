import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { validateDTO } from '../../middleware/validateDTO'
import { changePasswordSchema, sessionParamsSchema, updateProfileSchema } from './DTO/index.dto'
import {
  changePasswordController,
  listSessionsController,
  revokeSessionController,
  updateProfileController,
} from './profile.controller'

const router: ExpressRouter = Router()

router.use(auth)
router.patch('/', validateDTO({ body: updateProfileSchema }), updateProfileController)
router.patch('/password', validateDTO({ body: changePasswordSchema }), changePasswordController)
router.get('/sessions', listSessionsController)
router.delete('/sessions/:id', validateDTO({ params: sessionParamsSchema }), revokeSessionController)

export default router
