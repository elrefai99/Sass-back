import type { Application } from 'express'
import authModule from './module/authentication/auth.module'
import companyModule from './module/company/company.module'
import { invitationsRouter, onboardingRouter } from './module/onboarding/onboarding.module'
import departmentModule from './module/department/department.module'
import employeeModule from './module/employee/employee.module'
import taskModule from './module/task/task.module'
import taskCommentModule from './module/task-comment/task-comment.module'
import attendanceModule from './module/attendance/attendance.module'
import billingModule from './module/billing/billing.module'
import notificationModule from './module/notification/notification.module'
import dashboardModule from './module/dashboard/dashboard.module'
import profileModule from './module/profile/profile.module'
import uploadModule from './module/upload/upload.module'

export default (app: Application) => {
     app.use('/api/v1/auth', authModule)
     app.use('/api/v1/company', companyModule)
     app.use('/api/v1/company/onboarding', onboardingRouter)
     app.use('/api/v1/invitations', invitationsRouter)
     app.use('/api/v1/departments', departmentModule)
     app.use('/api/v1/employees', employeeModule)
     app.use('/api/v1/tasks/:taskId/comments', taskCommentModule)
     app.use('/api/v1/tasks', taskModule)
     app.use('/api/v1/attendance', attendanceModule)
     app.use('/api/v1/billing', billingModule)
     app.use('/api/v1/notifications', notificationModule)
     app.use('/api/v1/dashboard', dashboardModule)
     app.use('/api/v1/profile', profileModule)
     app.use('/api/v1/uploads', uploadModule)
}
