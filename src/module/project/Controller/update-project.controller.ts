import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { projectService } from '../Service/project.service'

export const updateProjectController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await projectService.update(req.user!.companyId, req.user!, String(req.params.id), req.body)
  sendSuccess(res, 'Project updated successfully', data)
})
