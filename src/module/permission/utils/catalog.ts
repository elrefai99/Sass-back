export type PermissionCatalogEntry = { key: string; label: string; group: string }

export const PERMISSION_CATALOG: PermissionCatalogEntry[] = [
  { key: 'company:read', label: 'View company', group: 'company' },
  { key: 'company:update', label: 'Update company settings', group: 'company' },
  { key: 'company:delete', label: 'Deactivate company', group: 'company' },

  { key: 'users:read', label: 'View users', group: 'users' },
  { key: 'users:update', label: 'Update users', group: 'users' },
  { key: 'users:delete', label: 'Deactivate users', group: 'users' },

  { key: 'employees:create', label: 'Create employees', group: 'employees' },
  { key: 'employees:read', label: 'View employees', group: 'employees' },
  { key: 'employees:update', label: 'Update employees', group: 'employees' },
  { key: 'employees:delete', label: 'Delete employees', group: 'employees' },

  { key: 'departments:create', label: 'Create departments', group: 'departments' },
  { key: 'departments:read', label: 'View departments', group: 'departments' },
  { key: 'departments:update', label: 'Update departments', group: 'departments' },
  { key: 'departments:delete', label: 'Delete departments', group: 'departments' },

  { key: 'teams:create', label: 'Create teams', group: 'teams' },
  { key: 'teams:read', label: 'View teams', group: 'teams' },
  { key: 'teams:update', label: 'Update teams', group: 'teams' },
  { key: 'teams:delete', label: 'Delete teams', group: 'teams' },

  { key: 'roles:create', label: 'Create roles', group: 'roles' },
  { key: 'roles:read', label: 'View roles', group: 'roles' },
  { key: 'roles:update', label: 'Update roles', group: 'roles' },
  { key: 'roles:delete', label: 'Delete roles', group: 'roles' },

  { key: 'permissions:read', label: 'View permission catalog', group: 'permissions' },

  { key: 'attendance:read', label: 'View attendance', group: 'attendance' },
  { key: 'attendance:manage', label: 'Clock in/out and manage attendance', group: 'attendance' },

  { key: 'projects:create', label: 'Create projects', group: 'projects' },
  { key: 'projects:read', label: 'View projects', group: 'projects' },
  { key: 'projects:update', label: 'Update projects', group: 'projects' },
  { key: 'projects:delete', label: 'Delete projects', group: 'projects' },

  { key: 'tasks:create', label: 'Create tasks', group: 'tasks' },
  { key: 'tasks:read', label: 'View tasks', group: 'tasks' },
  { key: 'tasks:update', label: 'Update tasks', group: 'tasks' },
  { key: 'tasks:delete', label: 'Delete tasks', group: 'tasks' },

  { key: 'notifications:read', label: 'View notifications', group: 'notifications' },

  { key: 'subscription:read', label: 'View subscription', group: 'subscription' },
  { key: 'subscription:manage', label: 'Upgrade subscription plan', group: 'subscription' },

  { key: 'audit-logs:read', label: 'View audit logs', group: 'audit-logs' },
]

export const SYSTEM_ROLE_DEFAULT_PERMISSIONS: Record<'owner' | 'admin' | 'manager' | 'employee', string[]> = {
  owner: PERMISSION_CATALOG.map((entry) => entry.key),
  admin: PERMISSION_CATALOG.map((entry) => entry.key).filter((key) => key !== 'company:delete'),
  manager: [
    'company:read',
    'employees:read',
    'departments:read',
    'teams:create',
    'teams:read',
    'teams:update',
    'roles:read',
    'permissions:read',
    'attendance:read',
    'attendance:manage',
    'projects:create',
    'projects:read',
    'projects:update',
    'tasks:create',
    'tasks:read',
    'tasks:update',
    'tasks:delete',
    'notifications:read',
    'subscription:read',
  ],
  employee: [
    'company:read',
    'departments:read',
    'teams:read',
    'attendance:read',
    'attendance:manage',
    'projects:read',
    'tasks:read',
    'tasks:update',
    'notifications:read',
  ],
}
