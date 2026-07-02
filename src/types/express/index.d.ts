import 'express'
import type { SystemRole } from '../../shared/enums'

declare global {
     namespace Express {
          export interface Request {
               user?: {
                    id: string
                    companyId: string
                    role: SystemRole
                    email?: string
                    name?: string
               };
               lang?: string;
               clientIP?: any;
               useragent?: any
               geo?: any;
               requestId?: string;
          }
     }
}

export { }
