import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { authenticationService } from '../Service/auth.service'

export const registerCompanyController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await authenticationService.registerCompany(req.body, {
    ip: req.clientIP,
    userAgent: req.useragent?.source,
  })
  sendSuccess(res, 'Company registered successfully', data, 201)
})
