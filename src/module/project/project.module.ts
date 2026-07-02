import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { requireRole } from '../../middleware/require-role'
import { validateDTO } from '../../middleware/validateDTO'
import {
  createProjectSchema,
  listProjectsQuerySchema,
  projectParamsSchema,
  updateProjectSchema,
} from './DTO/index.dto'
import {
  createProjectController,
  deleteProjectController,
  getProjectController,
  listProjectsController,
  updateProjectController,
} from './project.controller'

const router: ExpressRouter = Router()

router.use(auth)

/**
 * @openapi
 * /api/v1/projects:
 *   get:
 *     tags: [Projects]
 *     summary: List projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [planning, active, on_hold, completed, archived] }
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
router.get('/', validateDTO({ query: listProjectsQuerySchema }), listProjectsController)

/**
 * @openapi
 * /api/v1/projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get a project by id
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
router.get('/:id', validateDTO({ params: projectParamsSchema }), getProjectController)

/**
 * @openapi
 * /api/v1/projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create a project
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
 *               status: { type: string, enum: [planning, active, on_hold, completed, archived] }
 *               ownerId: { type: string }
 *               departmentId: { type: string }
 *               teamId: { type: string }
 *               startDate: { type: string, format: date-time }
 *               dueDate: { type: string, format: date-time }
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
router.post('/', requireRole('manager'), validateDTO({ body: createProjectSchema }), createProjectController)

/**
 * @openapi
 * /api/v1/projects/{id}:
 *   patch:
 *     tags: [Projects]
 *     summary: Update a project
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
 *               status: { type: string, enum: [planning, active, on_hold, completed, archived] }
 *               ownerId: { type: string }
 *               departmentId: { type: string }
 *               teamId: { type: string }
 *               startDate: { type: string, format: date-time }
 *               dueDate: { type: string, format: date-time }
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
  requireRole('manager'),
  validateDTO({ params: projectParamsSchema, body: updateProjectSchema }),
  updateProjectController,
)

/**
 * @openapi
 * /api/v1/projects/{id}:
 *   delete:
 *     tags: [Projects]
 *     summary: Delete a project
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
router.delete('/:id', requireRole('admin'), validateDTO({ params: projectParamsSchema }), deleteProjectController)

export default router
