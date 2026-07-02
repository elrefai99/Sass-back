import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { roleService } from '../Service/role.service'

export const deleteRoleController: RequestHandler = asyncHandler(async (req, res) => {
  await roleService.delete(req.user!.companyId, req.user!, String(req.params.id))
  sendSuccess(res, 'Role deleted successfully', null)
})
