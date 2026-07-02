import { ActivityLogModel } from '../../../schema'
import { idOf } from '../../../shared/document'
import { buildDateRangeFilter } from '../../../shared/filter'
import { buildMeta, parsePagination } from '../../../shared/pagination'
import type { ListAuditLogsQueryDTO } from '../DTO/index.dto'

export class AuditLogService {
  async list(companyId: string, query: ListAuditLogsQueryDTO) {
    const { page, pageSize, skip } = parsePagination(query)

    const filter: Record<string, unknown> = {
      companyId,
      ...buildDateRangeFilter('createdAt', query.from, query.to),
    }

    if (query.actorId) {
      filter.actorId = query.actorId
    }
    if (query.action) {
      filter.action = { $regex: query.action, $options: 'i' }
    }
    if (query.entity) {
      filter.entity = { $regex: query.entity, $options: 'i' }
    }

    const [logs, total] = await Promise.all([
      ActivityLogModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      ActivityLogModel.countDocuments(filter),
    ])

    return {
      data: logs.map((log) => this.serialize(log)),
      meta: buildMeta(page, pageSize, total),
    }
  }

  private serialize(log: any) {
    return {
      id: idOf(log),
      companyId: log.companyId.toString(),
      actorId: log.actorId ? log.actorId.toString() : null,
      actorName: log.actorName,
      action: log.action,
      message: log.message,
      entity: log.entity ?? null,
      createdAt: log.createdAt,
    }
  }
}

export const auditLogService = new AuditLogService()
