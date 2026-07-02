export type TaskView = {
  id: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: Date | null
  assignee: {
    id: string
    name: string
    email: string
  } | null
  order: number
}
