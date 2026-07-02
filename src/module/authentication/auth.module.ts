import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { validateDTO } from '../../middleware/validateDTO'
import {
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerCompanySchema,
  resetPasswordSchema,
} from './DTO/index.dto'
import {
  forgotPasswordController,
  getCurrentSessionController,
  loginController,
  logoutController,
  refreshTokenController,
  registerCompanyController,
  resetPasswordController,
} from './auth.controller'

const router: ExpressRouter = Router()

router.post('/register', validateDTO({ body: registerCompanySchema }), registerCompanyController)
router.post('/login', validateDTO({ body: loginSchema }), loginController)
router.post('/refresh', validateDTO({ body: refreshTokenSchema }), refreshTokenController)
router.post('/logout', auth, validateDTO({ body: logoutSchema }), logoutController)
router.post('/forgot-password', validateDTO({ body: forgotPasswordSchema }), forgotPasswordController)
router.post('/reset-password', validateDTO({ body: resetPasswordSchema }), resetPasswordController)
router.get('/me', auth, getCurrentSessionController)

export default router
