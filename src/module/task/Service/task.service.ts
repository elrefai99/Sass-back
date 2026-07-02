import { EmployeeModel, TaskModel } from '../../../schema'
import { buildMeta, parsePagination } from '../../../shared/pagination'
import { idOf } from '../../../shared/document'
import { writeActivity } from '../../../shared/activity'
import { notifyUser } from '../../../shared/notify'
import { AppError } from '../../../utils/errors/app-error'
import type { CreateTaskDTO, ListTasksQueryDTO, MoveTaskDTO, UpdateTaskDTO } from '../DTO/index.dto'

export class TaskService {
  async list(companyId: string, query: ListTasksQueryDTO) {
    const { page, pageSize, skip } = parsePagination(query)
    const filter: Record<string, unknown> = { companyId }

    if (query.status) filter.status = query.status
    if (query.priority) filter.priority = query.priority
    if (query.assigneeId) filter.assigneeId = query.assigneeId
    if (query.projectId) filter.projectId = query.projectId
    if (query.search) filter.title = { $regex: query.search, $options: 'i' }

    const sort: Record<string, 1 | -1> = {
      [query.sortBy]: query.sortDir === 'asc' ? 1 : -1,
      _id: 1,
    }

    const [tasks, total] = await Promise.all([
      TaskModel.find(filter).populate('assigneeId').sort(sort).skip(skip).limit(pageSize),
      TaskModel.countDocuments(filter),
    ])

    return {
      data: tasks.map((task) => this.serialize(task)),
      meta: buildMeta(page, pageSize, total),
    }
  }

  async get(companyId: string, taskId: string) {
    const task = await TaskModel.findOne({ _id: taskId, companyId }).populate('assigneeId')
    if (!task) {
      throw AppError.notFound('Task not found', 'NOT_FOUND')
    }

    return this.serialize(task)
  }

  async create(companyId: string, actor: { id: string; name?: string }, dto: CreateTaskDTO) {
    const assignee = dto.assigneeId ? await this.assertAssignee(companyId, dto.assigneeId) : null
    const task = await TaskModel.create({
      companyId,
      ...dto,
      dueDate: dto.dueDate ?? null,
      assigneeId: dto.assigneeId ?? null,
    })

    await this.afterAssigneeChange(task, assignee)
    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'task.created',
      message: `Task ${task.title} created`,
      entity: `task:${idOf(task)}`,
    })

    return this.get(companyId, idOf(task))
  }

  async update(companyId: string, actor: { id: string; name?: string }, taskId: string, dto: UpdateTaskDTO) {
    const assignee = dto.assigneeId ? await this.assertAssignee(companyId, dto.assigneeId) : null
    const task = await TaskModel.findOneAndUpdate(
      { _id: taskId, companyId },
      {
        ...dto,
        ...(Object.prototype.hasOwnProperty.call(dto, 'dueDate') ? { dueDate: dto.dueDate ?? null } : {}),
        ...(Object.prototype.hasOwnProperty.call(dto, 'assigneeId') ? { assigneeId: dto.assigneeId ?? null } : {}),
      },
      { new: true },
    ).populate('assigneeId')

    if (!task) {
      throw AppError.notFound('Task not found', 'NOT_FOUND')
    }

    if (dto.assigneeId) {
      await this.afterAssigneeChange(task, assignee)
    }

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'task.updated',
      message: `Task ${task.title} updated`,
      entity: `task:${taskId}`,
    })

    return this.serialize(task)
  }

  async move(companyId: string, actor: { id: string; name?: string }, taskId: string, dto: MoveTaskDTO) {
    const task = await TaskModel.findOneAndUpdate(
      { _id: taskId, companyId },
      { status: dto.status, order: dto.order },
      { new: true },
    ).populate('assigneeId')

    if (!task) {
      throw AppError.notFound('Task not found', 'NOT_FOUND')
    }

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'task.moved',
      message: `Task ${task.title} moved to ${dto.status}`,
      entity: `task:${taskId}`,
    })

    return this.serialize(task)
  }

  async delete(companyId: string, actor: { id: string; name?: string }, taskId: string) {
    const task = await TaskModel.findOneAndDelete({ _id: taskId, companyId })
    if (!task) {
      throw AppError.notFound('Task not found', 'NOT_FOUND')
    }

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'task.deleted',
      message: `Task ${task.title} deleted`,
      entity: `task:${taskId}`,
    })

    return null
  }

  private async assertAssignee(companyId: string, assigneeId: string) {
    const employee = await EmployeeModel.findOne({ _id: assigneeId, companyId, deletedAt: null })
    if (!employee) {
      throw AppError.notFound('Assignee not found', 'NOT_FOUND')
    }
    return employee
  }

  private async afterAssigneeChange(task: any, assignee: any) {
    if (!assignee?.userId) return
    await notifyUser({
      userId: assignee.userId.toString(),
      type: 'task_assigned',
      title: 'Task assigned',
      body: `You were assigned: ${task.title}`,
    })
  }

  private serialize(task: any) {
    const assignee = task.assigneeId && typeof task.assigneeId === 'object' ? task.assigneeId : null
    return {
      id: idOf(task),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ?? null,
      order: task.order,
      assigneeId: assignee ? idOf(assignee) : task.assigneeId?.toString?.() ?? null,
      assignee: assignee
        ? {
            id: idOf(assignee),
            name: assignee.name,
            email: assignee.email,
          }
        : null,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }
  }
}

export const taskService = new TaskService()
