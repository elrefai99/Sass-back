import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { companyService } from '../Service/company.service'

export const getCompanyController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await companyService.getCompany(req.user!.companyId)
  sendSuccess(res, 'Company fetched successfully', data)
})
