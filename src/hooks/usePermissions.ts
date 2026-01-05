import { useUserStore } from '@/stores/useUserStore'
import { PermissionModule, PermissionAction } from '@/types'

export const usePermissions = () => {
  const { currentUser, roles, groups, bus } = useUserStore()

  const checkPermission = (
    module: PermissionModule,
    action: PermissionAction,
  ): boolean => {
    if (!currentUser) return false

    // 0. Check User Specific Overrides (Extra Permissions)
    if (
      currentUser.extraPermissions &&
      currentUser.extraPermissions[module]?.includes(action)
    ) {
      return true
    }

    // 1. Gather all role IDs applicable to the user
    const applicableRoleIds = new Set<string>()

    // Direct Role
    if (currentUser.role) {
      applicableRoleIds.add(currentUser.role)
    }

    // Group Inherited Roles
    if (currentUser.groupIds) {
      currentUser.groupIds.forEach((groupId) => {
        const group = groups.find((g) => g.id === groupId)
        if (group && group.roleIds) {
          group.roleIds.forEach((roleId) => applicableRoleIds.add(roleId))
        }
      })
    }

    // BU Inherited Roles
    if (currentUser.buIds) {
      currentUser.buIds.forEach((buId) => {
        const bu = bus.find((b) => b.id === buId)
        if (bu && bu.roleIds) {
          bu.roleIds.forEach((roleId) => applicableRoleIds.add(roleId))
        }
      })
    }

    // 2. Check if ANY of the applicable roles has the permission
    let hasPermission = false

    applicableRoleIds.forEach((roleId) => {
      const roleDef = roles.find((r) => r.id === roleId)
      if (roleDef) {
        const permissions = roleDef.permissions[module] || []
        if (permissions.includes(action)) {
          hasPermission = true
        }
      }
    })

    return hasPermission
  }

  return {
    checkPermission,
    canView: (module: PermissionModule) => checkPermission(module, 'VIEW'),
    canCreate: (module: PermissionModule) => checkPermission(module, 'CREATE'),
    canEdit: (module: PermissionModule) => checkPermission(module, 'EDIT'),
    canDelete: (module: PermissionModule) => checkPermission(module, 'DELETE'),
    canExport: (module: PermissionModule) => checkPermission(module, 'EXPORT'),
  }
}
