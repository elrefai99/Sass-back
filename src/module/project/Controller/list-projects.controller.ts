import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { projectService } from '../Service/project.service'

export const listProjectsController: RequestHandler = asyncHandler(async (req, res) => {
  const result = await projectService.list(req.user!.companyId, req.validatedQuery)
  sendSuccess(res, 'Projects fetched successfully', result.data, 200, result.meta)
})
