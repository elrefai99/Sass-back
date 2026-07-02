import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { roleService } from '../Service/role.service'

export const getRoleController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await roleService.get(req.user!.companyId, String(req.params.id))
  sendSuccess(res, 'Role fetched successfully', data)
})
