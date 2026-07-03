import { generateUUID } from '../../../utils/uuid'
import { addJobToQueue } from '../../../MessageQueue/emails/Queue/queue.email'
import {
  CompanyModel,
  DepartmentModel,
  EmployeeModel,
  InvitationModel,
  SubscriptionModel,
} from '../../../schema'
import { writeActivity } from '../../../shared/activity'
import { addDays, createOpaqueToken, hashToken } from '../../../shared/security'
import { getPlanSeatLimit } from '../../../shared/plans'
import { assertCanAssignRole } from '../../../shared/authz'
import type { SystemRole } from '../../../shared/enums'
import { AppError } from '../../../utils/errors/app-error'
import type { CompleteOnboardingDTO, InviteEmployeesDTO } from '../DTO/index.dto'

type OnboardingActor = { id: string; name?: string; role: SystemRole }

export class OnboardingService {
  async completeOnboarding(companyId: string, actor: OnboardingActor, dto: CompleteOnboardingDTO) {
    const company = await CompanyModel.findById(companyId)
    if (!company) {
      throw AppError.notFound('Company not found', 'NOT_FOUND')
    }
    if (company.onboardedAt) {
      throw AppError.conflict('Onboarding already completed', 'CONFLICT')
    }

    const uniqueDepartments = Array.from(
      new Map(dto.extraDepartments.map((department) => [department.name.toLowerCase(), department])).values(),
    )

    if (uniqueDepartments.length > 0) {
      await DepartmentModel.insertMany(
        uniqueDepartments.map((department) => ({
          companyId,
          name: department.name,
          description: department.description ?? '',
          color: this.randomColor(),
          isDefault: false,
        })),
        { ordered: false },
      )
    }

    let invitationsSent = 0
    if (dto.invitations.length > 0) {
      invitationsSent = (await this.inviteEmployees(companyId, actor, { emails: dto.invitations, role: 'employee' })).sent
    }

    company.onboardedAt = new Date()
    await company.save()

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'onboarding.completed',
      message: 'Onboarding completed',
      entity: `company:${companyId}`,
    })

    return {
      onboardedAt: company.onboardedAt,
      departmentsCreated: uniqueDepartments.length,
      invitationsSent,
    }
  }

  async inviteEmployees(companyId: string, actor: OnboardingActor, dto: InviteEmployeesDTO) {
    // An invitation may not grant a role at or above the inviter's own level.
    assertCanAssignRole(actor.role, dto.role)
    const subscription = await SubscriptionModel.findOne({ companyId })
    if (!subscription) {
      throw AppError.forbidden('Plan required', 'PLAN_REQUIRED')
    }

    const seatLimit = getPlanSeatLimit(subscription.plan)
    const seatsUsed = await EmployeeModel.countDocuments({ companyId, deletedAt: null })
    const uniqueEmails = Array.from(new Set(dto.emails))
    if (seatLimit !== null && seatsUsed + uniqueEmails.length > seatLimit) {
      throw AppError.forbidden('Seat limit reached', 'SEAT_LIMIT_REACHED')
    }

    const skipped: string[] = []
    let sent = 0

    for (const email of uniqueEmails) {
      const token = createOpaqueToken()
      try {
        await InvitationModel.findOneAndUpdate(
          { companyId, email },
          {
            companyId,
            email,
            role: dto.role,
            tokenHash: hashToken(token),
            status: 'pending',
            expiresAt: addDays(new Date(), 7),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        )
        sent += 1
        await this.queueInvite(email, token)
      } catch {
        skipped.push(email)
      }
    }

    await writeActivity({
      companyId,
      actorId: actor.id,
      actorName: actor.name,
      action: 'invitation.sent',
      message: `${sent} invitation(s) sent`,
      entity: `invitation:${generateUUID().slice(0, 8)}`,
    })

    return { sent, skipped }
  }

  private randomColor() {
    const colors = ['#22d3ee', '#a855f7', '#f97316', '#22c55e', '#f472b6', '#64748b']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  private async queueInvite(email: string, token: string) {
    try {
      await addJobToQueue('sendEmail', {
        type: 'invite',
        email,
        subject: 'You are invited to Nexora ERP',
        emailBody: { token },
      })
    } catch {
      // Email queues should not break invitation writes.
    }
  }
}

export const onboardingService = new OnboardingService()
