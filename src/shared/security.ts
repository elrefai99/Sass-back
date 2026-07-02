import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { generateUUID } from '../utils/uuid'
import type { SystemRole } from './enums'

export type AccessTokenPayload = {
  sub: string
  companyId: string
  role: SystemRole
  jti: string
}

export const hashToken = (token: string): string => crypto.createHash('sha256').update(token).digest('hex')

export const createOpaqueToken = (): string => crypto.randomBytes(32).toString('hex')

const getAccessSecret = (): string =>
  process.env.JWT_ACCESS_SECRET ||
  process.env.API_KEY_SALT ||
  process.env.ACCESS_PRIVATE_KEY ||
  'development-access-secret'

export const signAccessToken = (payload: Omit<AccessTokenPayload, 'jti'>): string =>
  jwt.sign(
    {
      ...payload,
      jti: generateUUID(),
    },
    getAccessSecret(),
    { expiresIn: (process.env.ACCESS_TOKEN_TTL || '15m') as jwt.SignOptions['expiresIn'] },
  )

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, getAccessSecret()) as AccessTokenPayload

export const passwordMeetsPolicy = (password: string): boolean => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
