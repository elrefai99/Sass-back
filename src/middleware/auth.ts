import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { UserModel } from '../schema'
import { verifyAccessToken } from '../shared/security'
import { AppError } from '../utils/errors/app-error'

const getAccessToken = (req: Request): string | undefined => {
  const header = req.headers.authorization
  const bearerToken = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined
  if (bearerToken) return bearerToken

  const cookieToken = (req as any).cookies?.accessToken
  if (typeof cookieToken === 'string') return cookieToken

  const queryToken = req.query.accessToken || req.query.token
  return typeof queryToken === 'string' ? queryToken : undefined
}

export const auth: RequestHandler = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = getAccessToken(req)

    if (!token) {
      throw AppError.unauthorized('Missing access token', 'TOKEN_INVALID')
    }

    const payload = verifyAccessToken(token)
    const user = await UserModel.findById(payload.sub).select('_id companyId role email name isActive')

    if (!user || user.isActive === false) {
      throw AppError.unauthorized('Invalid access token', 'TOKEN_INVALID')
    }

    req.user = {
      id: user._id.toString(),
      companyId: user.companyId.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    }

    next()
  } catch (error: any) {
    if (error?.name === 'TokenExpiredError') {
      next(AppError.unauthorized('Access token expired', 'TOKEN_EXPIRED'))
      return
    }
    if (error?.name === 'JsonWebTokenError') {
      next(AppError.unauthorized('Invalid access token', 'TOKEN_INVALID'))
      return
    }
    next(error)
  }
}
