import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { validateDTO } from '../../middleware/validateDTO'
import {
  addCommentSchema,
  listCommentsQuerySchema,
  taskCommentParamsSchema,
  taskCommentTaskParamsSchema,
} from './DTO/index.dto'
import { addCommentController, deleteCommentController, listCommentsController } from './task-comment.controller'

const router: ExpressRouter = Router({ mergeParams: true })

router.use(auth)
router.get('/', validateDTO({ params: taskCommentTaskParamsSchema, query: listCommentsQuerySchema }), listCommentsController)
router.post('/', validateDTO({ params: taskCommentTaskParamsSchema, body: addCommentSchema }), addCommentController)
router.delete('/:commentId', validateDTO({ params: taskCommentParamsSchema }), deleteCommentController)

export default router
