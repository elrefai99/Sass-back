import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { projectService } from '../Service/project.service'

export const createProjectController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await projectService.create(req.user!.companyId, req.user!, req.body)
  sendSuccess(res, 'Project created successfully', data, 201)
})
