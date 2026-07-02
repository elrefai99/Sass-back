import { TeamModel } from '../../../schema'
import { idOf } from '../../../shared/document'
import { writeActivity } from '../../../shared/activity'
import { buildSearchFilter } from '../../../shared/filter'
import { AppError } from '../../../utils/errors/app-error'
import type {
  CreateTeamDTO,
  ListTeamsQueryDTO,
  UpdateTeamDTO,
} from '../DTO/index.dto'

export class TeamService {
  async list(companyId: string, query: ListTeamsQueryDTO) {
    const filter: Record<string, unknown> = {
      companyId,
      ...buildSearchFilter(query.search, ['name']),
    }

    const teams = await TeamModel.find(filter).sort({ name: 1 })
    return teams.map((team) => this.serialize(team))
  }

  async get(companyId: string, teamId: string) {
    const team = await TeamModel.findOne({ _id: teamId, companyId })
    if (!team) {
      throw AppError.notFound('Team not found', 'NOT_FOUND')
    }

    return this.serialize(team)
  }

  async create(companyId: string, actor: { id: string; name?: string }, dto: CreateTeamDTO) {
    const team = await TeamModel.create({
      companyId,
      name: dto.name,
      description: dto.description ?? '',
      departmentId: dto.departmentId ?? null,
      leadId: dto.leadId ?? null,
      memberIds: dto.memberIds ?? [],
    })

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'team.created',
      message: `Team ${team.name} created`,
      entity: `team:${idOf(team)}`,
    })

    return this.serialize(team)
  }

  async update(companyId: string, actor: { id: string; name?: string }, teamId: string, dto: UpdateTeamDTO) {
    const team = await TeamModel.findOneAndUpdate({ _id: teamId, companyId }, dto, { new: true })
    if (!team) {
      throw AppError.notFound('Team not found', 'NOT_FOUND')
    }

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'team.updated',
      message: `Team ${team.name} updated`,
      entity: `team:${idOf(team)}`,
    })

    return this.serialize(team)
  }

  async delete(companyId: string, actor: { id: string; name?: string }, teamId: string) {
    const team = await TeamModel.findOne({ _id: teamId, companyId })
    if (!team) {
      throw AppError.notFound('Team not found', 'NOT_FOUND')
    }

    if (team.memberIds.length > 0) {
      throw AppError.conflict(`Team has ${team.memberIds.length} member(s)`, 'CONFLICT')
    }

    await team.deleteOne()
    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'team.deleted',
      message: `Team ${team.name} deleted`,
      entity: `team:${teamId}`,
    })

    return null
  }

  private serialize(team: any) {
    return {
      id: idOf(team),
      name: team.name,
      description: team.description,
      departmentId: team.departmentId?.toString() ?? null,
      leadId: team.leadId?.toString() ?? null,
      memberIds: (team.memberIds ?? []).map((id: any) => id.toString()),
      memberCount: (team.memberIds ?? []).length,
      createdAt: team.createdAt,
    }
  }
}

export const teamService = new TeamService()
