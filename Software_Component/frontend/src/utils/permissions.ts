// Centralized permissions helper
// Use this module to check whether a given role has a specific permission.
// To grant a permission to more roles in future, update the `rolePermissions` map below.

export type RoleKey = 'nurse' | 'doctor' | 'admin'

export type Permission = 'patients:add' | 'patients:view' | 'patients:edit' | 'patients:delete'

const rolePermissions: Record<RoleKey, Permission[]> = {
  nurse: ['patients:add', 'patients:view'],
  doctor: ['patients:view'],
  admin: []
}

export const can = (role: RoleKey | string, permission: Permission): boolean => {
  // normalize incoming role strings to ensure we handle unknown roles gracefully
  const key = (role || '').toLowerCase() as RoleKey
  const perms = rolePermissions[key]
  if (!perms) return false
  return perms.includes(permission)
}

export default { can }