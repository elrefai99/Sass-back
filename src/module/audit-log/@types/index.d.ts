export type AuditLogView = {
  id: string
  companyId: string
  actorId: string | null
  actorName: string
  action: string
  message: string
  entity: string | null
  createdAt?: Date
}
