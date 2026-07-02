import { AttendanceRecordModel, CompanyModel, EmployeeModel } from '../../../schema'
import { buildMeta, parsePagination } from '../../../shared/pagination'
import { hasRole, type SystemRole } from '../../../shared/enums'
import { idOf } from '../../../shared/document'
import { writeActivity } from '../../../shared/activity'
import { AppError } from '../../../utils/errors/app-error'
import type { AttendanceHistoryQueryDTO, MonthlyReportQueryDTO } from '../DTO/index.dto'

export class AttendanceService {
  async today(companyId: string, actor: { id: string; role: SystemRole }) {
    const employee = await this.currentEmployee(companyId, actor.id)
    const today = this.startOfDay(new Date())
    const record = await AttendanceRecordModel.findOne({ companyId, employeeId: employee._id, date: today })

    const [checkedIn, absent] = await Promise.all([
      AttendanceRecordModel.countDocuments({ companyId, date: today, checkIn: { $ne: null } }),
      EmployeeModel.countDocuments({ companyId, deletedAt: null, status: 'active' }),
    ])

    return {
      record: record ? this.serialize(record) : null,
      stats: {
        checkedIn,
        expected: absent,
      },
    }
  }

  async checkIn(companyId: string, actor: { id: string; name?: string }) {
    const employee = await this.currentEmployee(companyId, actor.id)
    const company = await CompanyModel.findById(companyId).select('workdayStart')
    const now = new Date()
    const today = this.startOfDay(now)
    const existing = await AttendanceRecordModel.findOne({ companyId, employeeId: employee._id, date: today })

    if (existing?.checkIn) {
      throw AppError.conflict('Already checked in', 'CONFLICT')
    }

    const status = this.isLate(now, company?.workdayStart ?? '09:00') ? 'late' : 'present'
    const record = await AttendanceRecordModel.findOneAndUpdate(
      { companyId, employeeId: employee._id, date: today },
      { checkIn: now, status },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'attendance.checked_in',
      message: `${employee.name} checked in`,
      entity: `attendance:${idOf(record)}`,
    })

    return this.serialize(record)
  }

  async checkOut(companyId: string, actor: { id: string; name?: string }) {
    const employee = await this.currentEmployee(companyId, actor.id)
    const today = this.startOfDay(new Date())
    const record = await AttendanceRecordModel.findOne({ companyId, employeeId: employee._id, date: today })

    if (!record?.checkIn) {
      throw AppError.conflict('Cannot check out before check in', 'CONFLICT')
    }
    if (record.checkOut) {
      throw AppError.conflict('Already checked out', 'CONFLICT')
    }

    record.checkOut = new Date()
    record.workedHours = Number(((record.checkOut.getTime() - record.checkIn.getTime()) / 3600000).toFixed(1))
    await record.save()

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'attendance.checked_out',
      message: `${employee.name} checked out`,
      entity: `attendance:${idOf(record)}`,
    })

    return this.serialize(record)
  }

  async history(companyId: string, actor: { id: string; role: SystemRole }, query: AttendanceHistoryQueryDTO) {
    const { page, pageSize, skip } = parsePagination(query)
    const filter: Record<string, unknown> = { companyId }

    if (query.employeeId && hasRole(actor.role, 'manager')) {
      const employee = await EmployeeModel.exists({ _id: query.employeeId, companyId, deletedAt: null })
      if (!employee) throw AppError.notFound('Employee not found', 'NOT_FOUND')
      filter.employeeId = query.employeeId
    } else {
      const employee = await this.currentEmployee(companyId, actor.id)
      filter.employeeId = employee._id
    }

    if (query.from || query.to) {
      filter.date = {
        ...(query.from ? { $gte: this.startOfDay(query.from) } : {}),
        ...(query.to ? { $lte: this.startOfDay(query.to) } : {}),
      }
    }

    const [records, total] = await Promise.all([
      AttendanceRecordModel.find(filter).sort({ date: -1 }).skip(skip).limit(pageSize),
      AttendanceRecordModel.countDocuments(filter),
    ])

    return {
      data: records.map((record) => this.serialize(record)),
      meta: buildMeta(page, pageSize, total),
    }
  }

  async monthlyReport(companyId: string, actor: { id: string; role: SystemRole }, query: MonthlyReportQueryDTO) {
    const from = new Date(Date.UTC(query.year, query.month - 1, 1))
    const to = new Date(Date.UTC(query.year, query.month, 1))

    let employeeId: string | undefined = query.employeeId
    if (employeeId && hasRole(actor.role, 'manager')) {
      const employee = await EmployeeModel.exists({ _id: employeeId, companyId, deletedAt: null })
      if (!employee) throw AppError.notFound('Employee not found', 'NOT_FOUND')
    } else if (!hasRole(actor.role, 'manager')) {
      const employee = await this.currentEmployee(companyId, actor.id)
      employeeId = employee._id.toString()
    }

    const match: Record<string, unknown> = { companyId, date: { $gte: from, $lt: to } }
    if (employeeId) match.employeeId = employeeId

    const rows = await AttendanceRecordModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$employeeId',
          daysPresent: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          daysLate: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          daysAbsent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          daysOnLeave: { $sum: { $cond: [{ $eq: ['$status', 'on_leave'] }, 1, 0] } },
          totalWorkedHours: { $sum: { $ifNull: ['$workedHours', 0] } },
        },
      },
    ])

    const employees = await EmployeeModel.find({ _id: { $in: rows.map((row) => row._id) } }).select('name email')
    const employeeById = new Map(employees.map((employee) => [employee._id.toString(), employee]))

    return rows.map((row) => ({
      employeeId: row._id.toString(),
      employeeName: employeeById.get(row._id.toString())?.name ?? null,
      month: query.month,
      year: query.year,
      daysPresent: row.daysPresent,
      daysLate: row.daysLate,
      daysAbsent: row.daysAbsent,
      daysOnLeave: row.daysOnLeave,
      totalWorkedHours: Number(row.totalWorkedHours.toFixed(1)),
    }))
  }

  private async currentEmployee(companyId: string, userId: string) {
    const employee = await EmployeeModel.findOne({ companyId, userId, deletedAt: null })
    if (!employee) {
      throw AppError.notFound('Employee profile not found', 'NOT_FOUND')
    }
    return employee
  }

  private startOfDay(date: Date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  }

  private isLate(date: Date, workdayStart: string) {
    const [hours, minutes] = workdayStart.split(':').map(Number)
    const threshold = new Date(date)
    threshold.setHours(hours || 9, minutes || 0, 0, 0)
    return date > threshold
  }

  private serialize(record: any) {
    return {
      id: idOf(record),
      employeeId: record.employeeId.toString(),
      date: record.date,
      checkIn: record.checkIn ?? null,
      checkOut: record.checkOut ?? null,
      status: record.status,
      workedHours: record.workedHours ?? null,
    }
  }
}

export const attendanceService = new AttendanceService()
