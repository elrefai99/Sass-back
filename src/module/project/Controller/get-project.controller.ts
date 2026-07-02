import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { projectService } from '../Service/project.service'

export const getProjectController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await projectService.get(req.user!.companyId, String(req.params.id))
  sendSuccess(res, 'Project fetched successfully', data)
})
