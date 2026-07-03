import { DepartmentModel, EmployeeModel, UserModel } from '../schema'

/**
 * Guarantees the given user has an active Employee profile, creating one if it
 * is missing. Every person in a company — including the owner and users who
 * joined via invitation — needs an employee record for self-service features
 * such as attendance.
 *
 * Idempotent and safe to call repeatedly. Returns the employee document, or
 * `null` when the user/company can't be resolved (e.g. no department exists).
 */
export const ensureEmployeeProfile = async (companyId: string, userId: string) => {
  const active = await EmployeeModel.findOne({ companyId, userId, deletedAt: null })
  if (active) return active

  const user = await UserModel.findOne({ _id: userId, companyId })
  if (!user) return null

  // Reuse an employee row that already shares this email (e.g. added via HR
  // before the account existed) instead of violating the {companyId,email}
  // unique index.
  const byEmail = await EmployeeModel.findOne({ companyId, email: user.email })
  if (byEmail) {
    let changed = false
    if (!byEmail.userId) {
      byEmail.userId = user._id
      changed = true
    }
    if (byEmail.deletedAt) {
      byEmail.deletedAt = null
      byEmail.status = 'active'
      changed = true
    }
    if (changed) await byEmail.save()
    return byEmail
  }

  const department = await DepartmentModel.findOne({ companyId }).sort({ isDefault: -1, createdAt: 1 })
  if (!department) return null

  return EmployeeModel.create({
    companyId,
    userId: user._id,
    departmentId: department._id,
    name: user.name,
    email: user.email,
    phone: 'N/A',
    role: user.role === 'owner' ? 'Owner' : 'Team member',
    systemRole: user.role,
    salary: 0,
    status: 'active',
  })
}
