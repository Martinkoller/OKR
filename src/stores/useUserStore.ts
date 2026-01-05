import { create } from 'zustand'
import {
  User,
  BU,
  NotificationRule,
  KPI,
  OKR,
  RoleDefinition,
  Group,
  Alert,
  DashboardConfig,
  NotificationTargetType,
} from '@/types'
import { MOCK_BUS, MOCK_USERS, MOCK_ROLES, MOCK_GROUPS } from '@/data/mockData'

interface UserState {
  isAuthenticated: boolean
  currentUser: User | null
  // Refactored to support multiple BUs
  selectedBUIds: string[] // If contains 'GLOBAL', show all
  bus: BU[]
  users: User[]
  roles: RoleDefinition[]
  groups: Group[]
  notifications: Array<{
    id: string
    title: string
    message: string
    read: boolean
  }>
  // New alerts system
  alerts: Alert[]
  notificationRules: NotificationRule[]
  // Dashboard Config per BU
  dashboardConfigs: Record<string, DashboardConfig>

  // Auth
  login: (email: string) => boolean
  logout: () => void

  // Actions
  setCurrentUser: (user: User) => void
  // Updated selector action
  setSelectedBUs: (buIds: string[]) => void
  setDashboardConfig: (buId: string, config: DashboardConfig) => void
  addNotification: (title: string, message: string) => void
  markNotificationAsRead: (id: string) => void
  markAlertAsRead: (id: string) => void
  triggerSecurityAlert: (message: string, severity?: Alert['severity']) => void

  // User Management
  addUser: (user: User) => void
  updateUser: (user: User) => void
  deleteUser: (userId: string) => void

  // Role Management
  addRole: (role: RoleDefinition) => void
  updateRole: (role: RoleDefinition) => void
  deleteRole: (roleId: string) => void

  // Group Management
  addGroup: (group: Group) => void
  updateGroup: (group: Group) => void
  deleteGroup: (groupId: string) => void

  // BU Management
  addBU: (bu: BU) => void
  updateBU: (bu: BU) => void
  deleteBU: (buId: string) => void
  updateBURoles: (buId: string, roleIds: string[]) => void

  // Notification Rules
  addRule: (rule: NotificationRule) => void
  updateRule: (rule: NotificationRule) => void
  deleteRule: (ruleId: string) => void
  processNotification: (
    entity: KPI | OKR,
    entityType: 'KPI' | 'OKR',
    oldStatus: string,
    isRetroactive: boolean,
  ) => void

  // Helpers
  getAllAccessibleBUIds: (userId: string) => string[]
  isGlobalView: () => boolean
}

const MOCK_RULES: NotificationRule[] = [
  {
    id: 'rule-1',
    userId: 'u-1',
    name: 'Alerta Crítico Global',
    buId: 'ALL',
    targetType: 'ALL',
    kpiType: 'ALL',
    triggerCondition: 'STATUS_RED',
    channels: ['PORTAL', 'EMAIL'],
    isActive: true,
  },
]

export const useUserStore = create<UserState>((set, get) => ({
  isAuthenticated: false,
  currentUser: null,
  selectedBUIds: ['GLOBAL'],
  bus: MOCK_BUS,
  users: MOCK_USERS,
  roles: MOCK_ROLES,
  groups: MOCK_GROUPS,
  notifications: [],
  alerts: [],
  notificationRules: MOCK_RULES,
  dashboardConfigs: {},

  login: (email) => {
    const user = get().users.find((u) => u.email === email && u.active)
    if (user) {
      set({ currentUser: user, isAuthenticated: true })
      return true
    }
    return false
  },

  logout: () => {
    set({
      currentUser: null,
      isAuthenticated: false,
      selectedBUIds: ['GLOBAL'],
    })
  },

  setCurrentUser: (user) => set({ currentUser: user }),

  setSelectedBUs: (buIds) => {
    // Security check: verify if user has access to these BUs
    const { currentUser, getAllAccessibleBUIds, triggerSecurityAlert } = get()
    if (!currentUser) return

    if (buIds.includes('GLOBAL')) {
      set({ selectedBUIds: ['GLOBAL'] })
      return
    }

    const accessibleIds = getAllAccessibleBUIds(currentUser.id)
    const unauthorizedIds = buIds.filter(
      (id) => id !== 'GLOBAL' && !accessibleIds.includes(id),
    )

    if (unauthorizedIds.length > 0) {
      triggerSecurityAlert(
        `Tentativa de acesso não autorizado às BUs: ${unauthorizedIds.join(', ')}`,
        'HIGH',
      )
      // Reject change or strip unauthorized
      const validIds = buIds.filter((id) => accessibleIds.includes(id))
      set({ selectedBUIds: validIds.length > 0 ? validIds : ['GLOBAL'] })
      return
    }

    set({ selectedBUIds: buIds })
  },

  setDashboardConfig: (buId, config) => {
    set((state) => ({
      dashboardConfigs: {
        ...state.dashboardConfigs,
        [buId]: config,
      },
    }))
  },

  addNotification: (title, message) =>
    set((state) => ({
      notifications: [
        { id: Date.now().toString(), title, message, read: false },
        ...state.notifications,
      ],
    })),

  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    })),

  markAlertAsRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
    })),

  triggerSecurityAlert: (message, severity = 'MEDIUM') => {
    set((state) => ({
      alerts: [
        {
          id: `alert-${Date.now()}`,
          type: 'SECURITY',
          title: 'Alerta de Segurança',
          message,
          timestamp: new Date().toISOString(),
          read: false,
          severity,
        },
        ...state.alerts,
      ],
    }))
  },

  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (user) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === user.id ? user : u)),
      currentUser: state.currentUser?.id === user.id ? user : state.currentUser,
    })),
  deleteUser: (userId) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== userId),
    })),

  addRole: (role) => set((state) => ({ roles: [...state.roles, role] })),
  updateRole: (role) =>
    set((state) => ({
      roles: state.roles.map((r) => (r.id === role.id ? role : r)),
    })),
  deleteRole: (roleId) =>
    set((state) => ({
      roles: state.roles.filter((r) => r.id !== roleId),
    })),

  addGroup: (group) =>
    set((state) => ({
      groups: [...state.groups, group],
    })),
  updateGroup: (group) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.id === group.id ? group : g)),
    })),
  deleteGroup: (groupId) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== groupId),
    })),

  addBU: (bu) => set((state) => ({ bus: [...state.bus, bu] })),
  updateBU: (bu) =>
    set((state) => ({
      bus: state.bus.map((b) => (b.id === bu.id ? bu : b)),
    })),
  deleteBU: (buId) =>
    set((state) => ({
      bus: state.bus.filter((b) => b.id !== buId),
    })),

  updateBURoles: (buId, roleIds) =>
    set((state) => ({
      bus: state.bus.map((b) => (b.id === buId ? { ...b, roleIds } : b)),
    })),

  addRule: (rule) =>
    set((state) => ({
      notificationRules: [...state.notificationRules, rule],
    })),
  updateRule: (rule) =>
    set((state) => ({
      notificationRules: state.notificationRules.map((r) =>
        r.id === rule.id ? rule : r,
      ),
    })),
  deleteRule: (ruleId) =>
    set((state) => ({
      notificationRules: state.notificationRules.filter((r) => r.id !== ruleId),
    })),

  processNotification: (entity, entityType, oldStatus, isRetroactive) => {
    const state = get()

    state.notificationRules.forEach((rule) => {
      // 1. Check BU Scope
      if (rule.buId !== 'ALL' && rule.buId !== entity.buId) return

      // 2. Check Target Type (OKR/KPI)
      if (rule.targetType && rule.targetType !== 'ALL') {
        if (rule.targetType !== entityType) return
      }

      // 3. Check specific Entity ID (Custom Alert)
      if (rule.targetEntityId && rule.targetEntityId !== entity.id) return

      // 4. Check KPI Type (only for KPIs)
      if (
        entityType === 'KPI' &&
        rule.kpiType !== 'ALL' &&
        rule.kpiType !== (entity as KPI).type
      )
        return

      let shouldTrigger = false

      // 5. Evaluate Trigger Conditions
      if (
        rule.triggerCondition === 'STATUS_RED' &&
        entity.status === 'RED' &&
        oldStatus !== 'RED'
      ) {
        shouldTrigger = true
      } else if (
        rule.triggerCondition === 'STATUS_CHANGE' &&
        entity.status !== oldStatus
      ) {
        shouldTrigger = true
      } else if (
        rule.triggerCondition === 'RETROACTIVE_EDIT' &&
        isRetroactive
      ) {
        shouldTrigger = true
      } else if (rule.triggerCondition === 'THRESHOLD') {
        const currentValue =
          entityType === 'KPI'
            ? (entity as KPI).currentValue
            : (entity as OKR).progress
        if (rule.threshold !== undefined && rule.operator) {
          if (rule.operator === 'GREATER_THAN' && currentValue > rule.threshold)
            shouldTrigger = true
          if (rule.operator === 'LESS_THAN' && currentValue < rule.threshold)
            shouldTrigger = true
          if (rule.operator === 'EQUALS' && currentValue === rule.threshold)
            shouldTrigger = true
        }
      }

      if (shouldTrigger) {
        // Determine recipient (Owner or Rule Creator)
        // Ideally should alert the owner AND the rule creator
        // For now, simpler implementation: Alert the current user via alert list?
        // No, typically notifications go to specific users.
        // We will add alert to the store list which is global for now (needs user filtering in real app)
        // We will assume alerts are visible to everyone or filtered by receiver in backend.
        // Here we simulate alert for the current user if they are the owner or rule creator.

        const alertMessage =
          rule.triggerCondition === 'THRESHOLD'
            ? `O ${entityType} "${'title' in entity ? entity.title : entity.name}" ultrapassou o limite definido: ${rule.operator} ${rule.threshold}`
            : `O ${entityType} "${'title' in entity ? entity.title : entity.name}" disparou a regra "${rule.name}". Novo Status: ${entity.status}`

        if (rule.channels.includes('PORTAL')) {
          set((s) => ({
            alerts: [
              {
                id: `alert-${Date.now()}-${Math.random()}`,
                type: 'PERFORMANCE',
                title: `Alerta: ${'title' in entity ? entity.title : entity.name}`,
                message: alertMessage,
                timestamp: new Date().toISOString(),
                read: false,
                link:
                  entityType === 'KPI'
                    ? `/kpis/${entity.id}`
                    : `/okrs/${entity.id}`,
              },
              ...s.alerts,
            ],
          }))
        }
      }
    })
  },

  getAllAccessibleBUIds: (userId) => {
    const state = get()
    const user = state.users.find((u) => u.id === userId)
    if (!user) return []

    const explicitBUIds = user.buIds
    const allBUs = state.bus
    const accessibleIds = new Set<string>(explicitBUIds)

    // Helper to find descendants
    const findDescendants = (parentId: string) => {
      const children = allBUs.filter((b) => b.parentId === parentId)
      children.forEach((child) => {
        accessibleIds.add(child.id)
        findDescendants(child.id)
      })
    }

    explicitBUIds.forEach((id) => findDescendants(id))

    return Array.from(accessibleIds)
  },

  isGlobalView: () => {
    const { selectedBUIds } = get()
    return selectedBUIds.includes('GLOBAL')
  },
}))
