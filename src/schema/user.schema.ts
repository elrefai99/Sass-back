import { Schema, model, models } from 'mongoose'
import { SYSTEM_ROLES } from '../shared/enums'
import { schemaOptions } from './options'

const userSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String, default: null },
    role: { type: String, enum: SYSTEM_ROLES, default: 'employee' },
    customRoleId: { type: Schema.Types.ObjectId, ref: 'Role', default: null },
    isActive: { type: Boolean, default: true },
    emailVerifiedAt: { type: Date, default: null },
  },
  schemaOptions,
)

userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ companyId: 1 })

export const UserModel = models.User || model('User', userSchema)
