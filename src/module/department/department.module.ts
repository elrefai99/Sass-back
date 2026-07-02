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
router.get('/', validateDTO({ query: listDepartmentsQuerySchema }), listDepartmentsController)
router.get('/:id', validateDTO({ params: departmentParamsSchema }), getDepartmentController)
router.post('/', requireRole('admin'), validateDTO({ body: createDepartmentSchema }), createDepartmentController)
router.patch(
  '/:id',
  requireRole('admin'),
  validateDTO({ params: departmentParamsSchema, body: updateDepartmentSchema }),
  updateDepartmentController,
)
router.delete('/:id', requireRole('admin'), validateDTO({ params: departmentParamsSchema }), deleteDepartmentController)

export default router
