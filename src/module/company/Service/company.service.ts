import { CompanyModel, RefreshSessionModel, UserModel } from '../../../schema'
import { idOf } from '../../../shared/document'
import { writeActivity } from '../../../shared/activity'
import { AppError } from '../../../utils/errors/app-error'
import type { UpdateCompanySettingsDTO } from '../DTO/index.dto'

export class CompanyService {
  async getCompany(companyId: string) {
    const company = await CompanyModel.findById(companyId)
    if (!company) {
      throw AppError.notFound('Company not found', 'NOT_FOUND')
    }

    return this.serialize(company)
  }

  async updateCompany(companyId: string, actor: { id: string; name?: string }, dto: UpdateCompanySettingsDTO) {
    const company = await CompanyModel.findByIdAndUpdate(companyId, dto, { new: true })
    if (!company) {
      throw AppError.notFound('Company not found', 'NOT_FOUND')
    }

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'company.updated',
      message: 'Company settings updated',
      entity: `company:${companyId}`,
    })

    return this.serialize(company)
  }

  async deactivateCompany(companyId: string, actor: { id: string; name?: string }) {
    const company = await CompanyModel.findByIdAndUpdate(companyId, { isActive: false }, { new: true })
    if (!company) {
      throw AppError.notFound('Company not found', 'NOT_FOUND')
    }

    const users = await UserModel.find({ companyId }).select('_id')
    await RefreshSessionModel.updateMany(
      { userId: { $in: users.map((user) => user._id) }, revokedAt: null },
      { revokedAt: new Date() },
    )

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'company.deactivated',
      message: 'Company deactivated',
      entity: `company:${companyId}`,
    })

    return null
  }

  private serialize(company: any) {
    return {
      id: idOf(company),
      name: company.name,
      slug: company.slug,
      logoUrl: company.logoUrl ?? null,
      industry: company.industry,
      size: company.size,
      country: company.country,
      timezone: company.timezone,
      language: company.language,
      isActive: company.isActive,
      createdAt: company.createdAt,
      onboardedAt: company.onboardedAt,
    }
  }
}

export const companyService = new CompanyService()
