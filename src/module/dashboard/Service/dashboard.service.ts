import { Types } from 'mongoose'
import {
  ActivityLogModel,
  AttendanceRecordModel,
  DepartmentModel,
  EmployeeModel,
  SubscriptionModel,
  TaskModel,
} from '../../../schema'
import { idOf } from '../../../shared/document'
import type { DashboardActivityQueryDTO } from '../DTO/index.dto'

export class DashboardService {
  async stats(companyId: string) {
    const today = this.startOfDay(new Date())
    const [employees, activeEmployees, tasksOpen, tasksDone, todayCheckedIn, subscription] = await Promise.all([
      EmployeeModel.countDocuments({ companyId, deletedAt: null }),
      EmployeeModel.countDocuments({ companyId, deletedAt: null, status: 'active' }),
      TaskModel.countDocuments({ companyId, status: { $ne: 'done' } }),
      TaskModel.countDocuments({ companyId, status: 'done' }),
      AttendanceRecordModel.countDocuments({ companyId, date: today, checkIn: { $ne: null } }),
      SubscriptionModel.findOne({ companyId }),
    ])

    return {
      employees,
      activeEmployees,
      tasksOpen,
      tasksDone,
      todayCheckedIn,
      subscription: subscription
        ? {
            plan: subscription.plan,
            status: subscription.status,
            trialEndsAt: subscription.trialEndsAt,
          }
        : null,
    }
  }

  async charts(companyId: string) {
    const objectCompanyId = new Types.ObjectId(companyId)
    const [employeesByDepartment, tasksByStatus, attendanceLast7Days] = await Promise.all([
      DepartmentModel.aggregate([
        { $match: { companyId: objectCompanyId } },
        {
          $lookup: {
            from: 'employees',
            localField: '_id',
            foreignField: 'departmentId',
            as: 'employees',
          },
        },
        {
          $project: {
            id: '$_id',
            name: 1,
            color: 1,
            count: {
              $size: {
                $filter: {
                  input: '$employees',
                  as: 'employee',
                  cond: { $eq: ['$$employee.deletedAt', null] },
                },
              },
            },
          },
        },
      ]),
      TaskModel.aggregate([
        { $match: { companyId: objectCompanyId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      AttendanceRecordModel.aggregate([
        {
          $match: {
            companyId: objectCompanyId,
            date: { $gte: this.daysAgo(6) },
          },
        },
        {
          $group: {
            _id: '$date',
            checkedIn: { $sum: { $cond: [{ $ne: ['$checkIn', null] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ])

    return {
      employeesByDepartment: employeesByDepartment.map((item) => ({
        id: item.id.toString(),
        name: item.name,
        color: item.color,
        count: item.count,
      })),
      tasksByStatus: tasksByStatus.map((item) => ({ status: item._id, count: item.count })),
      attendanceLast7Days: attendanceLast7Days.map((item) => ({ date: item._id, checkedIn: item.checkedIn })),
    }
  }

  async activity(companyId: string, query: DashboardActivityQueryDTO) {
    const now = new Date()
    const nextWeek = new Date(now)
    nextWeek.setDate(now.getDate() + 7)

    const [activity, deadlines] = await Promise.all([
      ActivityLogModel.find({ companyId }).sort({ createdAt: -1 }).limit(query.limit),
      TaskModel.find({
        companyId,
        status: { $ne: 'done' },
        dueDate: { $gte: now, $lte: nextWeek },
      })
        .sort({ dueDate: 1 })
        .limit(query.limit),
    ])

    return {
      activity: activity.map((item) => ({
        id: idOf(item),
        actorId: item.actorId?.toString?.() ?? null,
        actorName: item.actorName,
        action: item.action,
        message: item.message,
        entity: item.entity,
        createdAt: item.createdAt,
      })),
      deadlines: deadlines.map((task) => ({
        id: idOf(task),
        title: task.title,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
      })),
    }
  }

  private startOfDay(date: Date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  }

  private daysAgo(days: number) {
    const date = this.startOfDay(new Date())
    date.setUTCDate(date.getUTCDate() - days)
    return date
  }
}

export const dashboardService = new DashboardService()
