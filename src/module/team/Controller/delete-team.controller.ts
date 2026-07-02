import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { teamService } from '../Service/team.service'

export const deleteTeamController: RequestHandler = asyncHandler(async (req, res) => {
  await teamService.delete(req.user!.companyId, req.user!, String(req.params.id))
  sendSuccess(res, 'Team deleted successfully', null)
})
