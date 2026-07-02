import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { ZodError, type ZodType } from 'zod'
import { AppError } from '../utils/errors/app-error'

type ValidationTarget = 'body' | 'query' | 'params'

export type DTOValidation = Partial<Record<ValidationTarget, ZodType>>

const mapZodErrors = (error: ZodError): Array<{ field: string; message: string }> =>
  error.issues.map((issue) => ({
    field: issue.path.join('.') || 'request',
    message: issue.message,
  }))

export const validateDTO = (schemas: DTOValidation): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as typeof req.query
      }
      if (schemas.body) {
        req.body = schemas.body.parse(req.body)
      }
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        next(AppError.unprocessable('Validation failed', 'VALIDATION_ERROR', mapZodErrors(error)))
        return
      }
      next(error)
    }
  }
}
