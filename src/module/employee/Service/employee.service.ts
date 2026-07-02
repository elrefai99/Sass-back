import { DepartmentModel, EmployeeModel, SubscriptionModel, UserModel } from '../../../schema'
import { buildMeta, parsePagination } from '../../../shared/pagination'
import { getPlanSeatLimit } from '../../../shared/plans'
import { hasRole, type SystemRole } from '../../../shared/enums'
import { idOf } from '../../../shared/document'
import { writeActivity } from '../../../shared/activity'
import { AppError } from '../../../utils/errors/app-error'
import type { CreateEmployeeDTO, ListEmployeesQueryDTO, UpdateEmployeeDTO } from '../DTO/index.dto'

export class EmployeeService {
  async list(companyId: string, viewerRole: SystemRole, query: ListEmployeesQueryDTO) {
    const { page, pageSize, skip } = parsePagination(query)
    const filter: Record<string, unknown> = { companyId, deletedAt: null }

    if (query.departmentId) filter.departmentId = query.departmentId
    if (query.status) filter.status = query.status
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { role: { $regex: query.search, $options: 'i' } },
      ]
    }

    const sort: Record<string, 1 | -1> = {
      [query.sortBy]: query.sortDir === 'asc' ? 1 : -1,
      _id: 1,
    }

    const [employees, total] = await Promise.all([
      EmployeeModel.find(filter).populate('departmentId').sort(sort).skip(skip).limit(pageSize),
      EmployeeModel.countDocuments(filter),
    ])

    return {
      data: employees.map((employee) => this.serialize(employee, viewerRole)),
      meta: buildMeta(page, pageSize, total),
    }
  }

  async options(companyId: string) {
    const employees = await EmployeeModel.find({ companyId, deletedAt: null, status: 'active' })
      .select('_id name email role')
      .sort({ name: 1 })

    return employees.map((employee) => ({
      id: idOf(employee),
      name: employee.name,
      email: employee.email,
      role: employee.role,
    }))
  }

  async get(companyId: string, viewerRole: SystemRole, employeeId: string) {
    const employee = await EmployeeModel.findOne({ _id: employeeId, companyId, deletedAt: null }).populate('departmentId')
    if (!employee) {
      throw AppError.notFound('Employee not found', 'NOT_FOUND')
    }

    return this.serialize(employee, viewerRole)
  }

  async create(companyId: string, actor: { id: string; name?: string; role: SystemRole }, dto: CreateEmployeeDTO) {
    await this.assertSeatAvailable(companyId)
    await this.assertDepartment(companyId, dto.departmentId)

    const existing = await EmployeeModel.exists({ companyId, email: dto.email, deletedAt: null })
    if (existing) {
      throw AppError.conflict('Employee email already exists', 'CONFLICT')
    }

    const linkedUser = await UserModel.findOne({ companyId, email: dto.email })
    const employee = await EmployeeModel.create({
      companyId,
      ...dto,
      userId: linkedUser?._id ?? null,
    })

    if (linkedUser) {
      linkedUser.role = dto.systemRole
      await linkedUser.save()
    }

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'employee.created',
      message: `Employee ${employee.name} created`,
      entity: `employee:${idOf(employee)}`,
    })

    return this.get(companyId, actor.role, idOf(employee))
  }

  async update(
    companyId: string,
    actor: { id: string; name?: string; role: SystemRole },
    employeeId: string,
    dto: UpdateEmployeeDTO,
  ) {
    if (dto.departmentId) {
      await this.assertDepartment(companyId, dto.departmentId)
    }

    const update = { ...dto }
    if (actor.role === 'manager') {
      delete update.salary
      delete update.systemRole
    }

    const employee = await EmployeeModel.findOneAndUpdate(
      { _id: employeeId, companyId, deletedAt: null },
      update,
      { new: true },
    ).populate('departmentId')

    if (!employee) {
      throw AppError.notFound('Employee not found', 'NOT_FOUND')
    }

    if (employee.userId && update.systemRole) {
      await UserModel.updateOne({ _id: employee.userId, companyId }, { role: update.systemRole })
    }

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'employee.updated',
      message: `Employee ${employee.name} updated`,
      entity: `employee:${employeeId}`,
    })

    return this.serialize(employee, actor.role)
  }

  async delete(companyId: string, actor: { id: string; name?: string }, employeeId: string) {
    const employee = await EmployeeModel.findOneAndUpdate(
      { _id: employeeId, companyId, deletedAt: null },
      { deletedAt: new Date(), status: 'inactive' },
      { new: true },
    )

    if (!employee) {
      throw AppError.notFound('Employee not found', 'NOT_FOUND')
    }

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'employee.deleted',
      message: `Employee ${employee.name} deleted`,
      entity: `employee:${employeeId}`,
    })

    return null
  }

  private async assertSeatAvailable(companyId: string) {
    const subscription = await SubscriptionModel.findOne({ companyId })
    if (!subscription) {
      throw AppError.forbidden('Plan required', 'PLAN_REQUIRED')
    }

    const seatLimit = getPlanSeatLimit(subscription.plan)
    if (seatLimit === null) return

    const seatsUsed = await EmployeeModel.countDocuments({ companyId, deletedAt: null })
    if (seatsUsed >= seatLimit) {
      throw AppError.forbidden('Seat limit reached', 'SEAT_LIMIT_REACHED')
    }
  }

  private async assertDepartment(companyId: string, departmentId: string) {
    const exists = await DepartmentModel.exists({ _id: departmentId, companyId })
    if (!exists) {
      throw AppError.notFound('Department not found', 'NOT_FOUND')
    }
  }

  private serialize(employee: any, viewerRole: SystemRole) {
    const department = employee.departmentId && typeof employee.departmentId === 'object' ? employee.departmentId : null
    const view: Record<string, unknown> = {
      id: idOf(employee),
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      departmentId: department ? idOf(department) : employee.departmentId?.toString(),
      department: department
        ? {
            id: idOf(department),
            name: department.name,
            color: department.color,
          }
        : null,
      role: employee.role,
      systemRole: employee.systemRole,
      status: employee.status,
      joinedAt: employee.joinedAt,
    }

    if (hasRole(viewerRole, 'manager')) {
      view.salary = employee.salary
    }

    return view
  }
}

export const employeeService = new EmployeeService()
