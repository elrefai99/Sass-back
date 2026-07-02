import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { projectService } from '../Service/project.service'

export const deleteProjectController: RequestHandler = asyncHandler(async (req, res) => {
  await projectService.delete(req.user!.companyId, req.user!, String(req.params.id))
  sendSuccess(res, 'Project deleted successfully', null)
})
