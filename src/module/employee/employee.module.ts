import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { requireRole } from '../../middleware/require-role'
import { validateDTO } from '../../middleware/validateDTO'
import {
  createEmployeeSchema,
  employeeParamsSchema,
  listEmployeesQuerySchema,
  updateEmployeeSchema,
} from './DTO/index.dto'
import {
  createEmployeeController,
  deleteEmployeeController,
  employeeOptionsController,
  getEmployeeController,
  listEmployeesController,
  updateEmployeeController,
} from './employee.controller'

const router: ExpressRouter = Router()

router.use(auth)

/**
 * @openapi
 * /api/v1/employees:
 *   get:
 *     tags: [Employees]
 *     summary: List employees
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
 *         name: departmentId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, on_leave, inactive] }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [name, salary, joinedAt] }
 *       - in: query
 *         name: sortDir
 *         schema: { type: string, enum: [asc, desc] }
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
router.get('/', validateDTO({ query: listEmployeesQuerySchema }), listEmployeesController)

/**
 * @openapi
 * /api/v1/employees/options:
 *   get:
 *     tags: [Employees]
 *     summary: Get employee options for select inputs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.get('/options', employeeOptionsController)

/**
 * @openapi
 * /api/v1/employees/{id}:
 *   get:
 *     tags: [Employees]
 *     summary: Get an employee by id
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
router.get('/:id', validateDTO({ params: employeeParamsSchema }), getEmployeeController)

/**
 * @openapi
 * /api/v1/employees:
 *   post:
 *     tags: [Employees]
 *     summary: Create an employee
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
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               departmentId: { type: string }
 *               role: { type: string }
 *               systemRole: { type: string, example: employee }
 *               salary: { type: number }
 *               status: { type: string, enum: [active, on_leave, inactive] }
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
router.post('/', requireRole('manager'), validateDTO({ body: createEmployeeSchema }), createEmployeeController)

/**
 * @openapi
 * /api/v1/employees/{id}:
 *   patch:
 *     tags: [Employees]
 *     summary: Update an employee
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
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               departmentId: { type: string }
 *               role: { type: string }
 *               systemRole: { type: string, example: employee }
 *               salary: { type: number }
 *               status: { type: string, enum: [active, on_leave, inactive] }
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
  validateDTO({ params: employeeParamsSchema, body: updateEmployeeSchema }),
  updateEmployeeController,
)

/**
 * @openapi
 * /api/v1/employees/{id}:
 *   delete:
 *     tags: [Employees]
 *     summary: Delete an employee
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
router.delete('/:id', requireRole('admin'), validateDTO({ params: employeeParamsSchema }), deleteEmployeeController)

export default router
