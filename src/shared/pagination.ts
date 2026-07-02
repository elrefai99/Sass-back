import type { PaginationMeta } from './response'

export type PaginationInput = {
  page?: number
  pageSize?: number
}

export const parsePagination = (input: PaginationInput): { page: number; pageSize: number; skip: number } => {
  const page = Math.max(1, Number(input.page ?? 1))
  const pageSize = Math.min(100, Math.max(1, Number(input.pageSize ?? 10)))

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
  }
}

export const buildMeta = (page: number, pageSize: number, total: number): PaginationMeta => ({
  page,
  pageSize,
  total,
  totalPages: Math.max(1, Math.ceil(total / pageSize)),
})
