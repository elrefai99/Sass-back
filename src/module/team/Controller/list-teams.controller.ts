import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { teamService } from '../Service/team.service'

export const listTeamsController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await teamService.list(req.user!.companyId, req.query)
  sendSuccess(res, 'Teams fetched successfully', data)
})
