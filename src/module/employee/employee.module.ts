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
router.get('/', validateDTO({ query: listEmployeesQuerySchema }), listEmployeesController)
router.get('/options', employeeOptionsController)
router.get('/:id', validateDTO({ params: employeeParamsSchema }), getEmployeeController)
router.post('/', requireRole('manager'), validateDTO({ body: createEmployeeSchema }), createEmployeeController)
router.patch(
  '/:id',
  requireRole('manager'),
  validateDTO({ params: employeeParamsSchema, body: updateEmployeeSchema }),
  updateEmployeeController,
)
router.delete('/:id', requireRole('admin'), validateDTO({ params: employeeParamsSchema }), deleteEmployeeController)

export default router
