import { useUserStore } from '@/stores/useUserStore'
import { PermissionModule, PermissionAction } from '@/types'

export const usePermissions = () => {
  const { currentUser, roles } = useUserStore()

  const checkPermission = (
    module: PermissionModule,
    action: PermissionAction,
  ): boolean => {
    if (!currentUser) return false

    const userRole = roles.find((r) => r.id === currentUser.role)
    if (!userRole) return false

    // Director General has implicit full access mostly, but following the matrix strictly:
    const permissions = userRole.permissions[module] || []
    return permissions.includes(action)
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
