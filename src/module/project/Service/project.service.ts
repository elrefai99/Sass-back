import { ProjectModel, TaskModel } from '../../../schema'
import { idOf } from '../../../shared/document'
import { writeActivity } from '../../../shared/activity'
import { buildMeta, parsePagination } from '../../../shared/pagination'
import { buildSearchFilter } from '../../../shared/filter'
import { AppError } from '../../../utils/errors/app-error'
import type { CreateProjectDTO, ListProjectsQueryDTO, UpdateProjectDTO } from '../DTO/index.dto'

export class ProjectService {
  async list(companyId: string, query: ListProjectsQueryDTO) {
    const { page, pageSize, skip } = parsePagination(query)
    const filter: Record<string, unknown> = {
      companyId,
      deletedAt: null,
      ...buildSearchFilter(query.search, ['name']),
      ...(query.status ? { status: query.status } : {}),
    }

    const [projects, total] = await Promise.all([
      ProjectModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      ProjectModel.countDocuments(filter),
    ])

    return {
      data: projects.map((project) => this.serialize(project)),
      meta: buildMeta(page, pageSize, total),
    }
  }

  async get(companyId: string, projectId: string) {
    const project = await ProjectModel.findOne({ _id: projectId, companyId, deletedAt: null })
    if (!project) {
      throw AppError.notFound('Project not found', 'NOT_FOUND')
    }

    const taskCount = await TaskModel.countDocuments({ companyId, projectId })
    return this.serialize(project, taskCount)
  }

  async create(companyId: string, actor: { id: string; name?: string }, dto: CreateProjectDTO) {
    const project = await ProjectModel.create({
      companyId,
      ...dto,
    })

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'project.created',
      message: `Project ${project.name} created`,
      entity: `project:${idOf(project)}`,
    })

    return this.serialize(project, 0)
  }

  async update(companyId: string, actor: { id: string; name?: string }, projectId: string, dto: UpdateProjectDTO) {
    const project = await ProjectModel.findOneAndUpdate({ _id: projectId, companyId, deletedAt: null }, dto, {
      new: true,
    })
    if (!project) {
      throw AppError.notFound('Project not found', 'NOT_FOUND')
    }

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'project.updated',
      message: `Project ${project.name} updated`,
      entity: `project:${projectId}`,
    })

    return this.serialize(project)
  }

  async delete(companyId: string, actor: { id: string; name?: string }, projectId: string) {
    const project = await ProjectModel.findOne({ _id: projectId, companyId, deletedAt: null })
    if (!project) {
      throw AppError.notFound('Project not found', 'NOT_FOUND')
    }

    project.deletedAt = new Date()
    await project.save()

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'project.deleted',
      message: `Project ${project.name} deleted`,
      entity: `project:${projectId}`,
    })

    return null
  }

  private serialize(project: any, taskCount?: number) {
    return {
      id: idOf(project),
      name: project.name,
      description: project.description,
      status: project.status,
      ownerId: project.ownerId.toString(),
      departmentId: project.departmentId?.toString() ?? null,
      teamId: project.teamId?.toString() ?? null,
      startDate: project.startDate ?? null,
      dueDate: project.dueDate ?? null,
      taskCount,
      createdAt: project.createdAt,
    }
  }
}

export const projectService = new ProjectService()
