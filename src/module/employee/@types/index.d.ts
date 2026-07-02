export type EmployeeView = {
  id: string
  name: string
  email: string
  phone: string
  departmentId: string
  department?: {
    id: string
    name: string
    color: string
  } | null
  role: string
  systemRole: string
  salary?: number
  status: string
  joinedAt: Date
}
