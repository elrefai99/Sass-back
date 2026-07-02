import type { RequestHandler } from 'express'
import { AppError } from '../utils/errors/app-error'

export const requirePermission =
  (key: string): RequestHandler =>
  (req, _res, next) => {
    if (req.user?.role === 'owner') {
      next()
      return
    }

    if (!req.user?.permissions?.includes(key)) {
      next(AppError.forbidden('Forbidden', 'FORBIDDEN'))
      return
    }

    next()
  }
