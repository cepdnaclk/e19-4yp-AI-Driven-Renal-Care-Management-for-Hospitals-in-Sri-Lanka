// Centralized permissions helper
// Use this module to check whether a given role has a specific permission.
// To grant a permission to more roles in future, update the `rolePermissions` map below.

export type RoleKey = 'nurse' | 'doctor' | 'admin'

export type Permission = 'patients:add' | 'patients:view' | 'patients:edit' | 'patients:delete'

const rolePermissions: Record<RoleKey, Permission[]> = {
  nurse: ['patients:add', 'patients:view'],
  doctor: ['patients:view', 'patients:edit'],
  // grant admin all current permissions; update this map when new permissions are added
  admin: ['patients:add', 'patients:view', 'patients:edit', 'patients:delete']
}

export const can = (role: RoleKey | string | undefined, permission: Permission): boolean => {
  if (!role) return false
  const key = (role as string).toLowerCase() as RoleKey
  const perms = rolePermissions[key]
  if (!perms) return false
  return perms.includes(permission)
}

export default { can }