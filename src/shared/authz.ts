import { roleRank, type SystemRole } from './enums'
import { AppError } from '../utils/errors/app-error'
import { SYSTEM_ROLE_DEFAULT_PERMISSIONS } from '../module/permission/utils/catalog'

/**
 * Central authorization rules for role/permission granting.
 *
 * Guiding principle: no actor may grant a level of access at or above their own.
 * This blocks vertical privilege escalation (e.g. a manager minting an admin)
 * and lateral escalation (e.g. an admin disabling a peer admin or the owner).
 */

export type Actor = {
  id: string
  role: SystemRole
  permissions?: string[]
}

/** A system role an actor is allowed to grant: strictly below their own rank, never `owner`. */
export const canAssignRole = (actorRole: SystemRole, targetRole: SystemRole): boolean => {
  if (targetRole === 'owner') return false
  return roleRank[actorRole] > roleRank[targetRole]
}

export const assertCanAssignRole = (actorRole: SystemRole, targetRole: SystemRole): void => {
  if (!canAssignRole(actorRole, targetRole)) {
    throw AppError.forbidden(
      `You cannot assign the "${targetRole}" role; you may only grant roles below your own level`,
      'ROLE_ASSIGNMENT_FORBIDDEN',
    )
  }
}

/**
 * Whether an actor may modify/deactivate a target user, based on the target's
 * current system role. An actor can only act on users strictly below their rank.
 */
export const canActOnUserRole = (actorRole: SystemRole, targetRole: SystemRole): boolean =>
  roleRank[actorRole] > roleRank[targetRole]

export const assertCanActOnUserRole = (actorRole: SystemRole, targetRole: SystemRole): void => {
  if (!canActOnUserRole(actorRole, targetRole)) {
    throw AppError.forbidden(
      'You cannot modify a user at or above your own access level',
      'USER_MODIFY_FORBIDDEN',
    )
  }
}

/** The effective permission keys an actor holds (custom role overrides the system-role defaults). */
export const effectivePermissions = (actor: Actor): string[] => {
  if (actor.permissions && actor.permissions.length > 0) return actor.permissions
  return SYSTEM_ROLE_DEFAULT_PERMISSIONS[actor.role] ?? []
}

/**
 * An actor may only grant permission keys they themselves hold. Prevents an
 * admin from creating a custom role that carries owner-only permissions (e.g.
 * `company:delete`) and then assigning it to escalate.
 */
export const assertCanGrantPermissions = (actor: Actor, requested: string[] | undefined): void => {
  if (!requested || requested.length === 0) return
  const held = new Set(effectivePermissions(actor))
  const exceeded = requested.filter((key) => !held.has(key))
  if (exceeded.length > 0) {
    throw AppError.forbidden(
      `You cannot grant permissions you do not hold: ${exceeded.join(', ')}`,
      'PERMISSION_GRANT_FORBIDDEN',
    )
  }
}
