import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { companyService } from '../Service/company.service'

export const deactivateCompanyController: RequestHandler = asyncHandler(async (req, res) => {
  await companyService.deactivateCompany(req.user!.companyId, req.user!)
  sendSuccess(res, 'Company deactivated successfully', null)
})
