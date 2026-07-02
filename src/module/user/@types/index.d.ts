export type UserView = {
  id: string
  name: string
  email: string
  role: string
  customRoleId: string | null
  isActive: boolean
  emailVerifiedAt: Date | null
  avatarUrl: string | null
  createdAt?: Date
}
