import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { requireRole } from '../../middleware/require-role'
import { validateDTO } from '../../middleware/validateDTO'
import {
  createDepartmentSchema,
  departmentParamsSchema,
  listDepartmentsQuerySchema,
  updateDepartmentSchema,
} from './DTO/index.dto'
import {
  createDepartmentController,
  deleteDepartmentController,
  getDepartmentController,
  listDepartmentsController,
  updateDepartmentController,
} from './department.controller'

const router: ExpressRouter = Router()

router.use(auth)

/**
 * @openapi
 * /api/v1/departments:
 *   get:
 *     tags: [Departments]
 *     summary: List departments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
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
router.get('/', validateDTO({ query: listDepartmentsQuerySchema }), listDepartmentsController)

/**
 * @openapi
 * /api/v1/departments/{id}:
 *   get:
 *     tags: [Departments]
 *     summary: Get a department by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
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
router.get('/:id', validateDTO({ params: departmentParamsSchema }), getDepartmentController)

/**
 * @openapi
 * /api/v1/departments:
 *   post:
 *     tags: [Departments]
 *     summary: Create a department
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               color: { type: string, example: '#3366ff' }
 *     responses:
 *       201:
 *         description: Created
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
router.post('/', requireRole('admin'), validateDTO({ body: createDepartmentSchema }), createDepartmentController)

/**
 * @openapi
 * /api/v1/departments/{id}:
 *   patch:
 *     tags: [Departments]
 *     summary: Update a department
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               color: { type: string, example: '#3366ff' }
 *     responses:
 *       200:
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
router.patch(
  '/:id',
  requireRole('admin'),
  validateDTO({ params: departmentParamsSchema, body: updateDepartmentSchema }),
  updateDepartmentController,
)

/**
 * @openapi
 * /api/v1/departments/{id}:
 *   delete:
 *     tags: [Departments]
 *     summary: Delete a department
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
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
router.delete('/:id', requireRole('admin'), validateDTO({ params: departmentParamsSchema }), deleteDepartmentController)

export default router
