export type ProjectView = {
  id: string
  name: string
  description: string
  status: string
  ownerId: string
  departmentId: string | null
  teamId: string | null
  startDate: Date | null
  dueDate: Date | null
  taskCount?: number
  createdAt?: Date
}
