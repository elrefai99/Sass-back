import type { RequestHandler } from 'express'
import { hasRole, type SystemRole } from '../shared/enums'
import { AppError } from '../utils/errors/app-error'

export const requireRole =
  (role: SystemRole): RequestHandler =>
  (req, _res, next) => {
    if (!hasRole(req.user?.role, role)) {
      next(AppError.forbidden('Forbidden', 'FORBIDDEN'))
      return
    }

    next()
  }
