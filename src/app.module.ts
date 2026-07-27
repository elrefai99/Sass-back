import type { Application } from 'express'
import authModule from './module/authentication/auth.module'
import companyModule from './module/company/company.module'
import { invitationsRouter, onboardingRouter } from './module/onboarding/onboarding.module'
import departmentModule from './module/department/department.module'
import employeeModule from './module/employee/employee.module'
import taskModule from './module/task/task.module'
import taskCommentModule from './module/task-comment/task-comment.module'
import attendanceModule from './module/attendance/attendance.module'
import subscriptionModule from './module/subscription/subscription.module'
import notificationModule from './module/notification/notification.module'
import dashboardModule from './module/dashboard/dashboard.module'
import profileModule from './module/profile/profile.module'
import uploadModule from './module/upload/upload.module'
import userModule from './module/user/user.module'
import roleModule from './module/role/role.module'
import permissionModule from './module/permission/permission.module'
import teamModule from './module/team/team.module'
import projectModule from './module/project/project.module'
import auditLogModule from './module/audit-log/audit-log.module'
import chatModule from './module/chat/chat.module'
import analyticsModule from './module/analytics/analytics.module'

export default (app: Application) => {
     app.use('/api/v1/auth', authModule)
     app.use('/api/v1/company', companyModule)
     app.use('/api/v1/company/onboarding', onboardingRouter)
     app.use('/api/v1/invitations', invitationsRouter)
     app.use('/api/v1/users', userModule)
     app.use('/api/v1/roles', roleModule)
     app.use('/api/v1/permissions', permissionModule)
     app.use('/api/v1/departments', departmentModule)
     app.use('/api/v1/employees', employeeModule)
     app.use('/api/v1/teams', teamModule)
     app.use('/api/v1/projects', projectModule)
     app.use('/api/v1/tasks/:taskId/comments', taskCommentModule)
     app.use('/api/v1/tasks', taskModule)
     app.use('/api/v1/attendance', attendanceModule)
     app.use('/api/v1/subscription', subscriptionModule)
     app.use('/api/v1/notifications', notificationModule)
     app.use('/api/v1/dashboard', dashboardModule)
     app.use('/api/v1/profile', profileModule)
     app.use('/api/v1/uploads', uploadModule)
     app.use('/api/v1/audit-logs', auditLogModule)
     app.use('/api/v1/chat', chatModule)
     app.use('/api/v1/analytics', analyticsModule)
}
