import { Types } from 'mongoose'
import { AnalyticsEventModel } from '../../../schema'
import { addAnalyticsEventJob } from '../../../MessageQueue/analytics/Queue/queue.analytics'
import { idOf } from '../../../shared/document'
import { buildDateRangeFilter } from '../../../shared/filter'
import { buildMeta, parsePagination } from '../../../shared/pagination'
import { logger } from '../../../utils/logger'
import type { AnalyticsListQueryDTO } from '../DTO/index.dto'
import type {
  AnalyticsEventInput,
  PageViewSummary,
  RealtimeStats,
  UserActivitySummary,
  VisitorSummary,
} from '../@types'

const REALTIME_WINDOW_MS = 5 * 60 * 1000

export class AnalyticsService {
  async recordEvent(input: AnalyticsEventInput): Promise<void> {
    try {
      await addAnalyticsEventJob(input)
    } catch (error) {
      logger.error({ error }, 'Failed to enqueue analytics event; writing inline')
      try {
        await AnalyticsEventModel.create(input)
      } catch (createError) {
        logger.error({ error: createError }, 'Failed to write analytics event inline')
      }
    }
  }

  async visitors(companyId: string, query: AnalyticsListQueryDTO) {
    const { page, pageSize, skip } = parsePagination(query)
    const filter = {
      companyId: new Types.ObjectId(companyId),
      ...buildDateRangeFilter('createdAt', query.from, query.to),
    }

    const [result] = await AnalyticsEventModel.aggregate([
      { $match: filter },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: '$visitorId',
          userId: { $last: '$userId' },
          requestCount: { $sum: 1 },
          firstSeen: { $min: '$createdAt' },
          lastSeen: { $max: '$createdAt' },
          lastRoute: { $last: '$route' },
          country: { $last: '$country' },
        },
      },
      { $sort: { lastSeen: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: pageSize }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ])

    const total = result?.totalCount?.[0]?.count ?? 0
    const data: VisitorSummary[] = (result?.data ?? []).map((item: any) => ({
      visitorId: item._id,
      userId: item.userId ? item.userId.toString() : null,
      isAuthenticated: Boolean(item.userId),
      requestCount: item.requestCount,
      firstSeen: item.firstSeen,
      lastSeen: item.lastSeen,
      lastRoute: item.lastRoute,
      country: item.country ?? null,
    }))

    return { data, meta: buildMeta(page, pageSize, total) }
  }

  async users(companyId: string, query: AnalyticsListQueryDTO) {
    const { page, pageSize, skip } = parsePagination(query)
    const filter = {
      companyId: new Types.ObjectId(companyId),
      userId: { $ne: null },
      ...buildDateRangeFilter('createdAt', query.from, query.to),
    }

    const [result] = await AnalyticsEventModel.aggregate([
      { $match: filter },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: '$userId',
          userEmail: { $last: '$userEmail' },
          requestCount: { $sum: 1 },
          firstSeen: { $min: '$createdAt' },
          lastSeen: { $max: '$createdAt' },
          lastRoute: { $last: '$route' },
        },
      },
      { $sort: { lastSeen: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: pageSize }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ])

    const total = result?.totalCount?.[0]?.count ?? 0
    const data: UserActivitySummary[] = (result?.data ?? []).map((item: any) => ({
      userId: item._id.toString(),
      userEmail: item.userEmail ?? null,
      requestCount: item.requestCount,
      firstSeen: item.firstSeen,
      lastSeen: item.lastSeen,
      lastRoute: item.lastRoute,
    }))

    return { data, meta: buildMeta(page, pageSize, total) }
  }

  async pageViews(companyId: string, query: AnalyticsListQueryDTO) {
    const { page, pageSize, skip } = parsePagination(query)
    const filter = {
      companyId: new Types.ObjectId(companyId),
      ...buildDateRangeFilter('createdAt', query.from, query.to),
    }

    const [result] = await AnalyticsEventModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$route',
          count: { $sum: 1 },
          avgResponseTimeMs: { $avg: '$responseTimeMs' },
          lastSeen: { $max: '$createdAt' },
        },
      },
      { $sort: { count: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: pageSize }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ])

    const total = result?.totalCount?.[0]?.count ?? 0
    const data: PageViewSummary[] = (result?.data ?? []).map((item: any) => ({
      route: item._id,
      count: item.count,
      avgResponseTimeMs: Math.round(item.avgResponseTimeMs),
      lastSeen: item.lastSeen,
    }))

    return { data, meta: buildMeta(page, pageSize, total) }
  }

  async realtime(companyId: string): Promise<RealtimeStats> {
    const now = new Date()
    const since = new Date(now.getTime() - REALTIME_WINDOW_MS)
    const startOfDay = this.startOfDay(now)
    const companyObjectId = new Types.ObjectId(companyId)

    const [activeVisitorIds, onlineUserIds, totalRequestsToday, uniqueVisitorsToday] = await Promise.all([
      AnalyticsEventModel.distinct('visitorId', { companyId: companyObjectId, createdAt: { $gte: since } }),
      AnalyticsEventModel.distinct('userId', {
        companyId: companyObjectId,
        userId: { $ne: null },
        createdAt: { $gte: since },
      }),
      AnalyticsEventModel.countDocuments({ companyId: companyObjectId, createdAt: { $gte: startOfDay } }),
      AnalyticsEventModel.distinct('visitorId', { companyId: companyObjectId, createdAt: { $gte: startOfDay } }),
    ])

    return {
      activeVisitors: activeVisitorIds.length,
      onlineUsers: onlineUserIds.length,
      totalRequestsToday,
      uniqueVisitorsToday: uniqueVisitorsToday.length,
    }
  }

  async byUser(companyId: string, userId: string, query: AnalyticsListQueryDTO) {
    const { page, pageSize, skip } = parsePagination(query)
    const filter = {
      companyId,
      userId,
      ...buildDateRangeFilter('createdAt', query.from, query.to),
    }

    const [events, total] = await Promise.all([
      AnalyticsEventModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      AnalyticsEventModel.countDocuments(filter),
    ])

    return {
      data: events.map((event) => this.serialize(event)),
      meta: buildMeta(page, pageSize, total),
    }
  }

  private serialize(event: any) {
    return {
      id: idOf(event),
      requestId: event.requestId,
      userId: event.userId ? event.userId.toString() : null,
      userEmail: event.userEmail ?? null,
      visitorId: event.visitorId,
      ip: event.ip,
      method: event.method,
      url: event.url,
      route: event.route,
      statusCode: event.statusCode,
      responseTimeMs: event.responseTimeMs,
      browser: event.browser,
      os: event.os,
      deviceType: event.deviceType,
      country: event.country,
      region: event.region,
      city: event.city,
      createdAt: event.createdAt,
    }
  }

  private startOfDay(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  }
}

export const analyticsService = new AnalyticsService()
