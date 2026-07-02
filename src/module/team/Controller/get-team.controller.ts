import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { teamService } from '../Service/team.service'

export const getTeamController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await teamService.get(req.user!.companyId, String(req.params.id))
  sendSuccess(res, 'Team fetched successfully', data)
})
