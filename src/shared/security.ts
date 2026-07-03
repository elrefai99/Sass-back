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

const getAccessSecret = (): string => {
  const secret = process.env.JWT_ACCESS_SECRET
  if (secret) return secret
  // Never fall back to a hardcoded secret in a real environment: an attacker
  // who knows it can forge tokens for any user/tenant. Only tests get a stub.
  if (process.env.NODE_ENV === 'test') return 'test-only-access-secret'
  throw new Error('JWT_ACCESS_SECRET is not set — refusing to sign/verify tokens with a default secret')
}

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
