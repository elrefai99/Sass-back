import type { Response } from 'express'

export type PaginationMeta = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export const sendSuccess = (
  res: Response,
  message: string,
  data: unknown = null,
  statusCode = 200,
  meta?: PaginationMeta,
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  })
}
