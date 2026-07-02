export const buildSearchFilter = (term: string | undefined, fields: string[]): Record<string, unknown> => {
  if (!term) return {}
  return {
    $or: fields.map((field) => ({ [field]: { $regex: term, $options: 'i' } })),
  }
}

export const buildDateRangeFilter = (
  field: string,
  from?: Date,
  to?: Date,
): Record<string, unknown> => {
  if (!from && !to) return {}
  return {
    [field]: {
      ...(from ? { $gte: from } : {}),
      ...(to ? { $lte: to } : {}),
    },
  }
}
