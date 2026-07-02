import { TaskCommentModel, TaskModel } from '../../../schema'
import { buildMeta, parsePagination } from '../../../shared/pagination'
import { hasRole, type SystemRole } from '../../../shared/enums'
import { idOf } from '../../../shared/document'
import { writeActivity } from '../../../shared/activity'
import { AppError } from '../../../utils/errors/app-error'
import type { AddCommentDTO, ListCommentsQueryDTO } from '../DTO/index.dto'

export class TaskCommentService {
  async list(companyId: string, taskId: string, query: ListCommentsQueryDTO) {
    await this.assertTask(companyId, taskId)
    const { page, pageSize, skip } = parsePagination(query)

    const [comments, total] = await Promise.all([
      TaskCommentModel.find({ companyId, taskId })
        .populate('authorId', 'name email')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(pageSize),
      TaskCommentModel.countDocuments({ companyId, taskId }),
    ])

    return {
      data: comments.map((comment) => this.serialize(comment)),
      meta: buildMeta(page, pageSize, total),
    }
  }

  async add(companyId: string, actor: { id: string; name?: string }, taskId: string, dto: AddCommentDTO) {
    await this.assertTask(companyId, taskId)

    const comment = await TaskCommentModel.create({
      companyId,
      taskId,
      authorId: actor.id,
      body: dto.body,
    })

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'task_comment.created',
      message: 'Comment added to task',
      entity: `task:${taskId}`,
    })

    const populated = await TaskCommentModel.findById(comment._id).populate('authorId', 'name email')
    return this.serialize(populated)
  }

  async delete(
    companyId: string,
    actor: { id: string; name?: string; role: SystemRole },
    taskId: string,
    commentId: string,
  ) {
    await this.assertTask(companyId, taskId)
    const comment = await TaskCommentModel.findOne({ _id: commentId, companyId, taskId })
    if (!comment) {
      throw AppError.notFound('Comment not found', 'NOT_FOUND')
    }

    const isAuthor = comment.authorId.toString() === actor.id
    if (!isAuthor && !hasRole(actor.role, 'manager')) {
      throw AppError.forbidden('Forbidden', 'FORBIDDEN')
    }

    await comment.deleteOne()
    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'task_comment.deleted',
      message: 'Comment deleted from task',
      entity: `task:${taskId}`,
    })

    return null
  }

  private async assertTask(companyId: string, taskId: string) {
    const exists = await TaskModel.exists({ _id: taskId, companyId })
    if (!exists) {
      throw AppError.notFound('Task not found', 'NOT_FOUND')
    }
  }

  private serialize(comment: any) {
    const author = comment?.authorId && typeof comment.authorId === 'object' ? comment.authorId : null
    return {
      id: idOf(comment),
      taskId: comment.taskId.toString(),
      body: comment.body,
      author: author
        ? {
            id: idOf(author),
            name: author.name,
            email: author.email,
          }
        : {
            id: comment.authorId?.toString?.(),
            name: 'Unknown user',
          },
      createdAt: comment.createdAt,
    }
  }
}

export const taskCommentService = new TaskCommentService()
