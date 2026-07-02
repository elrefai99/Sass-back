import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { roleService } from '../Service/role.service'

export const updateRoleController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await roleService.update(req.user!.companyId, req.user!, String(req.params.id), req.body)
  sendSuccess(res, 'Role updated successfully', data)
})
