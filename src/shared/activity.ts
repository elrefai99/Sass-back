import { ActivityLogModel } from '../schema'

export const writeActivity = async (input: {
  companyId: string
  actorId?: string
  actorName?: string
  action: string
  message: string
  entity?: string
}): Promise<void> => {
  await ActivityLogModel.create({
    companyId: input.companyId,
    actorId: input.actorId,
    actorName: input.actorName || 'System',
    action: input.action,
    message: input.message,
    entity: input.entity,
  })
}
