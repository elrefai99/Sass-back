import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { requireRole } from '../../middleware/require-role'
import { validateDTO } from '../../middleware/validateDTO'
import { updateCompanySettingsSchema } from './DTO/index.dto'
import { getCompanyController, updateCompanySettingsController } from './company.controller'

const router: ExpressRouter = Router()

router.use(auth)
router.get('/', getCompanyController)
router.patch('/', requireRole('admin'), validateDTO({ body: updateCompanySettingsSchema }), updateCompanySettingsController)

export default router
