import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { requireRole } from '../../middleware/require-role'
import { validateDTO } from '../../middleware/validateDTO'
import {
  createTeamSchema,
  teamParamsSchema,
  listTeamsQuerySchema,
  updateTeamSchema,
} from './DTO/index.dto'
import {
  createTeamController,
  deleteTeamController,
  getTeamController,
  listTeamsController,
  updateTeamController,
} from './team.controller'

const router: ExpressRouter = Router()

router.use(auth)

/**
 * @openapi
 * /api/v1/teams:
 *   get:
 *     tags: [Teams]
 *     summary: List teams
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
router.get('/', validateDTO({ query: listTeamsQuerySchema }), listTeamsController)

/**
 * @openapi
 * /api/v1/teams/{id}:
 *   get:
 *     tags: [Teams]
 *     summary: Get a team by id
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
router.get('/:id', validateDTO({ params: teamParamsSchema }), getTeamController)

/**
 * @openapi
 * /api/v1/teams:
 *   post:
 *     tags: [Teams]
 *     summary: Create a team
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
 *               departmentId: { type: string }
 *               leadId: { type: string }
 *               memberIds:
 *                 type: array
 *                 items: { type: string }
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
router.post('/', requireRole('admin'), validateDTO({ body: createTeamSchema }), createTeamController)

/**
 * @openapi
 * /api/v1/teams/{id}:
 *   patch:
 *     tags: [Teams]
 *     summary: Update a team
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
 *               departmentId: { type: string }
 *               leadId: { type: string }
 *               memberIds:
 *                 type: array
 *                 items: { type: string }
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
  validateDTO({ params: teamParamsSchema, body: updateTeamSchema }),
  updateTeamController,
)

/**
 * @openapi
 * /api/v1/teams/{id}:
 *   delete:
 *     tags: [Teams]
 *     summary: Delete a team
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
router.delete('/:id', requireRole('admin'), validateDTO({ params: teamParamsSchema }), deleteTeamController)

export default router
