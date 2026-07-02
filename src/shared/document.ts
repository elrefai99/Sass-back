import { isValidObjectId } from 'mongoose'

export const objectIdSchemaMessage = 'Invalid MongoDB ObjectId'

export const isObjectId = (value: string): boolean => isValidObjectId(value)

export const idOf = (document: any): string => document?._id?.toString?.() ?? document?.id?.toString?.() ?? ''

export const stripMongo = <T extends Record<string, any>>(input: T): T & { id: string } => {
  const obj = typeof input?.toObject === 'function' ? input.toObject({ virtuals: true }) : { ...input }
  const id = obj.id ?? obj._id?.toString?.()
  delete obj._id
  delete obj.__v
  return {
    ...obj,
    id,
  }
}
