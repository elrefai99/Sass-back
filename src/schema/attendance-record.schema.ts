import { Schema, model, models } from 'mongoose'
import { ATTENDANCE_STATUSES } from '../shared/enums'
import { schemaOptions } from './options'

const attendanceRecordSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    date: { type: Date, required: true },
    checkIn: { type: Date, default: null },
    checkOut: { type: Date, default: null },
    status: { type: String, enum: ATTENDANCE_STATUSES, default: 'absent' },
    workedHours: { type: Number, default: null },
  },
  schemaOptions,
)

attendanceRecordSchema.index({ employeeId: 1, date: 1 }, { unique: true })
attendanceRecordSchema.index({ companyId: 1, date: 1 })

export const AttendanceRecordModel =
  models.AttendanceRecord || model('AttendanceRecord', attendanceRecordSchema)
