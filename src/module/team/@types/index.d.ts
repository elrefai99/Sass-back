export type TeamView = {
  id: string
  name: string
  description: string
  departmentId: string | null
  leadId: string | null
  memberIds: string[]
  memberCount: number
  createdAt?: Date
}
