import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { companyService } from '../Service/company.service'

export const updateCompanySettingsController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await companyService.updateCompany(req.user!.companyId, req.user!, req.body)
  sendSuccess(res, 'Company updated successfully', data)
})
