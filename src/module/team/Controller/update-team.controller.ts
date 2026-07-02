import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { teamService } from '../Service/team.service'

export const updateTeamController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await teamService.update(req.user!.companyId, req.user!, String(req.params.id), req.body)
  sendSuccess(res, 'Team updated successfully', data)
})
