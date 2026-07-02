import { Types } from 'mongoose'
import { DepartmentModel, EmployeeModel } from '../../../schema'
import { idOf } from '../../../shared/document'
import { writeActivity } from '../../../shared/activity'
import { AppError } from '../../../utils/errors/app-error'
import type {
  CreateDepartmentDTO,
  ListDepartmentsQueryDTO,
  UpdateDepartmentDTO,
} from '../DTO/index.dto'

export class DepartmentService {
  async list(companyId: string, query: ListDepartmentsQueryDTO) {
    const filter: Record<string, unknown> = { companyId }
    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' }
    }

    const departments = await DepartmentModel.find(filter).sort({ isDefault: -1, name: 1 })
    const counts = await EmployeeModel.aggregate([
      { $match: { companyId: new Types.ObjectId(companyId), deletedAt: null } },
      { $group: { _id: '$departmentId', count: { $sum: 1 } } },
    ])
    const countByDepartment = new Map(counts.map((item) => [item._id.toString(), item.count]))

    return departments.map((department) =>
      this.serialize(department, countByDepartment.get(department._id.toString()) ?? 0),
    )
  }

  async get(companyId: string, departmentId: string) {
    const department = await DepartmentModel.findOne({ _id: departmentId, companyId })
    if (!department) {
      throw AppError.notFound('Department not found', 'NOT_FOUND')
    }

    const employeeCount = await EmployeeModel.countDocuments({ companyId, departmentId, deletedAt: null })
    return this.serialize(department, employeeCount)
  }

  async create(companyId: string, actor: { id: string; name?: string }, dto: CreateDepartmentDTO) {
    const department = await DepartmentModel.create({
      companyId,
      name: dto.name,
      description: dto.description ?? '',
      color: dto.color ?? '#6e79f4',
      isDefault: false,
    })

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'department.created',
      message: `Department ${department.name} created`,
      entity: `department:${idOf(department)}`,
    })

    return this.serialize(department, 0)
  }

  async update(companyId: string, actor: { id: string; name?: string }, departmentId: string, dto: UpdateDepartmentDTO) {
    const department = await DepartmentModel.findOneAndUpdate({ _id: departmentId, companyId }, dto, { new: true })
    if (!department) {
      throw AppError.notFound('Department not found', 'NOT_FOUND')
    }

    const employeeCount = await EmployeeModel.countDocuments({ companyId, departmentId, deletedAt: null })
    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'department.updated',
      message: `Department ${department.name} updated`,
      entity: `department:${idOf(department)}`,
    })

    return this.serialize(department, employeeCount)
  }

  async delete(companyId: string, actor: { id: string; name?: string }, departmentId: string) {
    const department = await DepartmentModel.findOne({ _id: departmentId, companyId })
    if (!department) {
      throw AppError.notFound('Department not found', 'NOT_FOUND')
    }

    const employeeCount = await EmployeeModel.countDocuments({ companyId, departmentId, deletedAt: null })
    if (employeeCount > 0) {
      throw AppError.conflict(`Department has ${employeeCount} employee(s)`, 'CONFLICT')
    }

    await department.deleteOne()
    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'department.deleted',
      message: `Department ${department.name} deleted`,
      entity: `department:${departmentId}`,
    })

    return null
  }

  private serialize(department: any, employeeCount?: number) {
    return {
      id: idOf(department),
      name: department.name,
      description: department.description,
      color: department.color,
      isDefault: department.isDefault,
      employeeCount,
      createdAt: department.createdAt,
    }
  }
}

export const departmentService = new DepartmentService()
