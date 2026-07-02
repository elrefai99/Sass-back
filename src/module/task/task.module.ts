import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { validateDTO } from '../../middleware/validateDTO'
import {
  createTaskSchema,
  listTasksQuerySchema,
  moveTaskSchema,
  taskParamsSchema,
  updateTaskSchema,
} from './DTO/index.dto'
import {
  createTaskController,
  deleteTaskController,
  getTaskController,
  listTasksController,
  moveTaskController,
  updateTaskController,
} from './task.controller'

const router: ExpressRouter = Router()

router.use(auth)
router.get('/', validateDTO({ query: listTasksQuerySchema }), listTasksController)
router.post('/', validateDTO({ body: createTaskSchema }), createTaskController)
router.get('/:id', validateDTO({ params: taskParamsSchema }), getTaskController)
router.patch('/:id/move', validateDTO({ params: taskParamsSchema, body: moveTaskSchema }), moveTaskController)
router.patch('/:id', validateDTO({ params: taskParamsSchema, body: updateTaskSchema }), updateTaskController)
router.delete('/:id', validateDTO({ params: taskParamsSchema }), deleteTaskController)

export default router
