import type { NextFunction, Request, Response } from 'express'
import { Error as MongooseError } from 'mongoose'
import { AppError } from './app-error'
import { logger } from '../../utils/logger'

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error({ err }, 'Non-operational error')
    }

    res.status(err.statusCode).json({
      success: false,
      ...(err.code && { code: err.code }),
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    })
    return
  }

  if (err instanceof MongooseError.ValidationError) {
    res.status(422).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: Object.entries(err.errors).map(([field, issue]) => ({
        field,
        message: issue.message,
      })),
    })
    return
  }

  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    res.status(409).json({
      success: false,
      code: 'CONFLICT',
      message: 'Duplicate entry',
    })
    return
  }

  // Unknown error — never expose stack trace
  if (err.name === 'CastError') {
    res.status(404).json({
      success: false,
      code: 'NOT_FOUND',
      message: 'Resource not found',
    })
    return
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      code: 'TOKEN_EXPIRED',
      message: 'Token expired',
    })
    return
  }

  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      code: 'TOKEN_INVALID',
      message: 'Token invalid',
    })
    return
  }

  logger.error({ err }, 'Unhandled error')
  res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
  })
}
