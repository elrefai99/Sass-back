import { Router, type Router as ExpressRouter } from 'express'
import { auth } from '../../middleware/auth'
import { requireRole } from '../../middleware/require-role'
import { validateDTO } from '../../middleware/validateDTO'
import { changePlanSchema, invoiceParamsSchema, listInvoicesQuerySchema } from './DTO/index.dto'
import {
  changePlanController,
  downloadInvoicePdfController,
  getSubscriptionController,
  listInvoicesController,
  listPlansController,
  stripeWebhookController,
} from './billing.controller'

const router: ExpressRouter = Router()

router.post('/webhook', stripeWebhookController)
router.get('/plans', auth, listPlansController)
router.get('/subscription', auth, requireRole('admin'), getSubscriptionController)
router.post('/subscription/change', auth, requireRole('owner'), validateDTO({ body: changePlanSchema }), changePlanController)
router.get('/invoices', auth, requireRole('admin'), validateDTO({ query: listInvoicesQuerySchema }), listInvoicesController)
router.get(
  '/invoices/:id/pdf',
  auth,
  requireRole('admin'),
  validateDTO({ params: invoiceParamsSchema }),
  downloadInvoicePdfController,
)

export default router
