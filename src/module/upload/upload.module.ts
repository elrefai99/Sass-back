import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { validateDTO } from '../../middleware/validateDTO'
import { requestUploadUrlSchema } from './DTO/index.dto'
import { requestUploadUrlController } from './upload.controller'

const router: ExpressRouter = Router()

router.use(auth)
/**
 * @openapi
 * /api/v1/uploads/presign:
 *   post:
 *     tags: [Uploads]
 *     summary: Request a pre-signed URL to upload a file
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               purpose: { type: string, enum: [company-logo, user-avatar, attachment] }
 *               contentType: { type: string, enum: [image/png, image/jpeg, image/webp, application/pdf] }
 *               size: { type: integer, example: 102400 }
 *     responses:
 *       201:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/presign', validateDTO({ body: requestUploadUrlSchema }), requestUploadUrlController)

export default router
