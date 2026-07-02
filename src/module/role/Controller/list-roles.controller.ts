import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { roleService } from '../Service/role.service'

export const listRolesController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await roleService.list(req.user!.companyId, req.validatedQuery)
  sendSuccess(res, 'Roles fetched successfully', data)
})
