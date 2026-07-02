export type RoleView = {
  id: string
  name: string
  key: string
  description: string
  isSystem: boolean
  permissionKeys: string[]
  createdAt?: Date
}
