import { Schema, model, models } from 'mongoose'
import { EMPLOYEE_STATUSES, SYSTEM_ROLES } from '../shared/enums'
import { schemaOptions } from './options'

const employeeSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    systemRole: { type: String, enum: SYSTEM_ROLES, default: 'employee' },
    salary: { type: Number, required: true, min: 0 },
    status: { type: String, enum: EMPLOYEE_STATUSES, default: 'active' },
    joinedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  schemaOptions,
)

employeeSchema.index({ companyId: 1, email: 1 }, { unique: true })
employeeSchema.index({ companyId: 1, departmentId: 1 })
employeeSchema.index({ companyId: 1, status: 1 })

export const EmployeeModel = models.Employee || model('Employee', employeeSchema)
