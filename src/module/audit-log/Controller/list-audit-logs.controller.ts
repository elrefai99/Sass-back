import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { auditLogService } from '../Service/audit-log.service'

export const listAuditLogsController: RequestHandler = asyncHandler(async (req, res) => {
  const result = await auditLogService.list(req.user!.companyId, req.validatedQuery)
  sendSuccess(res, 'Audit logs fetched successfully', result.data, 200, result.meta)
})
