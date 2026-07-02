import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { roleService } from '../Service/role.service'

export const createRoleController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await roleService.create(req.user!.companyId, req.user!, req.body)
  sendSuccess(res, 'Role created successfully', data, 201)
})
