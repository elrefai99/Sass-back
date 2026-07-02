import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { permissionService } from '../Service/permission.service'

export const listPermissionsController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await permissionService.list(req.user!.companyId)
  sendSuccess(res, 'Permissions fetched successfully', data)
})
