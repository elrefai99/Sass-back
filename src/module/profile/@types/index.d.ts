export type UserSessionView = {
  id: string
  userAgent: string | null
  ip: string | null
  expiresAt: Date
  createdAt: Date
  lastUsedAt: Date
}
