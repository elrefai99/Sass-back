import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { requireRole } from '../../middleware/require-role'
import { validateDTO } from '../../middleware/validateDTO'
import { updateCompanySettingsSchema } from './DTO/index.dto'
import { deactivateCompanyController, getCompanyController, updateCompanySettingsController } from './company.controller'

const router: ExpressRouter = Router()

router.use(auth)
/**
 * @openapi
 * /api/v1/company:
 *   get:
 *     tags: [Company]
 *     summary: Get the current company's details
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getCompanyController)
/**
 * @openapi
 * /api/v1/company:
 *   patch:
 *     tags: [Company]
 *     summary: Update the current company's settings (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: Acme Inc }
 *               industry: { type: string, example: technology }
 *               timezone: { type: string, example: Africa/Cairo }
 *               language: { type: string, example: en }
 *               logoUrl: { type: string, format: uri }
 *     responses:
 *       200:
 *         description: Company updated successfully
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
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/', requireRole('admin'), validateDTO({ body: updateCompanySettingsSchema }), updateCompanySettingsController)
/**
 * @openapi
 * /api/v1/company:
 *   delete:
 *     tags: [Company]
 *     summary: Deactivate the current company (owner only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/', requireRole('owner'), deactivateCompanyController)

export default router
