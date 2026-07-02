import type { RequestHandler } from 'express'
import { sendSuccess } from '../../../shared/response'
import { asyncHandler } from '../../../utils/api-requesthandler'
import { teamService } from '../Service/team.service'

export const createTeamController: RequestHandler = asyncHandler(async (req, res) => {
  const data = await teamService.create(req.user!.companyId, req.user!, req.body)
  sendSuccess(res, 'Team created successfully', data, 201)
})
