import { Application } from 'express'
import authModule from './module/authentication/auth.module'

export default (app: Application) => {
     app.use('/api/v1/auth', authModule)
     app.use('/api/v1/user', userModule)
     app.use('/api/v1/project', projectModule)
     app.use('/api/v1/notification', notificationModule)
     app.use('/api/v1/emails', emailsModule)
     app.use('/api/v1/diagram', diagramModule)
}
