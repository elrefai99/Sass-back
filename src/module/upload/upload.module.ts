import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { validateDTO } from '../../middleware/validateDTO'
import { requestUploadUrlSchema } from './DTO/index.dto'
import { requestUploadUrlController } from './upload.controller'

const router: ExpressRouter = Router()

router.use(auth)
router.post('/presign', validateDTO({ body: requestUploadUrlSchema }), requestUploadUrlController)

export default router
