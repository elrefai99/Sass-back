export const SYSTEM_ROLES = ['owner', 'admin', 'manager', 'employee'] as const
export type SystemRole = (typeof SYSTEM_ROLES)[number]

export const INDUSTRIES = [
  'technology',
  'finance',
  'healthcare',
  'retail',
  'manufacturing',
  'education',
  'logistics',
  'other',
] as const
export type Industry = (typeof INDUSTRIES)[number]

export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'] as const
export type CompanySize = (typeof COMPANY_SIZES)[number]

export const LANGUAGES = ['en', 'ar', 'fr', 'de', 'es'] as const
export type Language = (typeof LANGUAGES)[number]

export const EMPLOYEE_STATUSES = ['active', 'on_leave', 'inactive'] as const
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number]

export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export const ATTENDANCE_STATUSES = ['present', 'late', 'absent', 'on_leave'] as const
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number]

export const PLAN_IDS = ['trial', 'basic', 'pro'] as const
export type PlanId = (typeof PLAN_IDS)[number]

export const SUBSCRIPTION_STATUSES = ['trialing', 'active', 'past_due', 'canceled'] as const
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]

export const INVOICE_STATUSES = ['paid', 'open', 'failed'] as const
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export const NOTIFICATION_TYPES = [
  'task_assigned',
  'task_completed',
  'employee_joined',
  'billing',
  'attendance',
  'chat_message',
  'system',
] as const
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export const INVITATION_STATUSES = ['pending', 'accepted', 'expired', 'revoked'] as const
export type InvitationStatus = (typeof INVITATION_STATUSES)[number]

export const CONVERSATION_TYPES = ['dm', 'group'] as const
export type ConversationType = (typeof CONVERSATION_TYPES)[number]

export const CONVERSATION_MEMBER_ROLES = ['member', 'admin'] as const
export type ConversationMemberRole = (typeof CONVERSATION_MEMBER_ROLES)[number]

export const MESSAGE_TYPES = ['text', 'system'] as const
export type MessageType = (typeof MESSAGE_TYPES)[number]

export const PROJECT_STATUSES = ['planning', 'active', 'on_hold', 'completed', 'archived'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const DEVICE_TYPES = ['desktop', 'mobile', 'tablet', 'bot', 'unknown'] as const
export type DeviceType = (typeof DEVICE_TYPES)[number]

export const roleRank: Record<SystemRole, number> = {
  employee: 1,
  manager: 2,
  admin: 3,
  owner: 4,
}

export const hasRole = (actual: SystemRole | undefined, required: SystemRole): boolean => {
  if (!actual) return false
  return roleRank[actual] >= roleRank[required]
}
