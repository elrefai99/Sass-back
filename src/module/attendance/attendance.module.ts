import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { validateDTO } from '../../middleware/validateDTO'
import { attendanceHistoryQuerySchema, monthlyReportQuerySchema } from './DTO/index.dto'
import {
  attendanceHistoryController,
  checkInController,
  checkOutController,
  monthlyReportController,
  todayOverviewController,
} from './attendance.controller'

const router: ExpressRouter = Router()

router.use(auth)
/**
 * @openapi
 * /api/v1/attendance/today:
 *   get:
 *     tags: [Attendance]
 *     summary: Get today's attendance overview for the current user
 *     security:
 *       - bearerAuth: []
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
router.get('/today', todayOverviewController)
/**
 * @openapi
 * /api/v1/attendance/check-in:
 *   post:
 *     tags: [Attendance]
 *     summary: Check in for the current work day
 *     security:
 *       - bearerAuth: []
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
router.post('/check-in', checkInController)
/**
 * @openapi
 * /api/v1/attendance/check-out:
 *   post:
 *     tags: [Attendance]
 *     summary: Check out for the current work day
 *     security:
 *       - bearerAuth: []
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
router.post('/check-out', checkOutController)
/**
 * @openapi
 * /api/v1/attendance/history:
 *   get:
 *     tags: [Attendance]
 *     summary: Get paginated attendance history
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: employeeId
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
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
router.get('/history', validateDTO({ query: attendanceHistoryQuerySchema }), attendanceHistoryController)
/**
 * @openapi
 * /api/v1/attendance/monthly-report:
 *   get:
 *     tags: [Attendance]
 *     summary: Get monthly attendance report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema: { type: integer, minimum: 1, maximum: 12 }
 *       - in: query
 *         name: year
 *         required: true
 *         schema: { type: integer, minimum: 2000, maximum: 2100 }
 *       - in: query
 *         name: employeeId
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
router.get('/monthly-report', validateDTO({ query: monthlyReportQuerySchema }), monthlyReportController)

export default router
