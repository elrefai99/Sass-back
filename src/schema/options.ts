import type { SchemaOptions } from 'mongoose'

export const schemaOptions: SchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: any) => {
      ret.id = ret._id?.toString()
      delete ret._id
      delete ret.passwordHash
      delete ret.tokenHash
      return ret
    },
  },
  toObject: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: any) => {
      ret.id = ret._id?.toString()
      delete ret._id
      delete ret.passwordHash
      delete ret.tokenHash
      return ret
    },
  },
}

export const datedOnlySchemaOptions: SchemaOptions = {
  ...schemaOptions,
  timestamps: false,
}
