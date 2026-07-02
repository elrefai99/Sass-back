export type CompanySettingsView = {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  industry: string
  size: string
  country: string
  timezone: string
  language: string
  createdAt?: Date
}
