import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { uploadService } from '../Service/upload.service'

export const requestUploadUrlController: RequestHandler = asyncHandler(async (req, res) => {
  const data = uploadService.requestUploadUrl(req.user!.companyId, req.body)
  sendSuccess(res, 'Upload URL created successfully', data, 201)
})
