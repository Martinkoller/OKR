import { create } from 'zustand'
import { User, BU, NotificationRule, KPI, RoleDefinition, Group } from '@/types'
import { MOCK_BUS, MOCK_USERS, MOCK_ROLES, MOCK_GROUPS } from '@/data/mockData'

interface UserState {
  isAuthenticated: boolean
  currentUser: User | null
  selectedBUId: string | 'GLOBAL'
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
  notificationRules: NotificationRule[]

  // Auth
  login: (email: string) => boolean
  logout: () => void

  // Actions
  setCurrentUser: (user: User) => void
  setSelectedBU: (buId: string | 'GLOBAL') => void
  addNotification: (title: string, message: string) => void
  markNotificationAsRead: (id: string) => void

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
  processKPINotification: (
    kpi: KPI,
    oldStatus: string,
    isRetroactive: boolean,
  ) => void

  // Helpers
  getAllAccessibleBUIds: (userId: string) => string[]
}

const MOCK_RULES: NotificationRule[] = [
  {
    id: 'rule-1',
    userId: 'u-1',
    name: 'Alerta Crítico Global',
    buId: 'ALL',
    kpiType: 'ALL',
    triggerCondition: 'STATUS_RED',
    channels: ['PORTAL', 'EMAIL'],
    isActive: true,
  },
]

export const useUserStore = create<UserState>((set, get) => ({
  isAuthenticated: false,
  currentUser: null,
  selectedBUId: 'GLOBAL',
  bus: MOCK_BUS,
  users: MOCK_USERS,
  roles: MOCK_ROLES,
  groups: MOCK_GROUPS,
  notifications: [],
  notificationRules: MOCK_RULES,

  login: (email) => {
    const user = get().users.find((u) => u.email === email && u.active)
    if (user) {
      set({ currentUser: user, isAuthenticated: true })
      return true
    }
    return false
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false, selectedBUId: 'GLOBAL' })
  },

  setCurrentUser: (user) => set({ currentUser: user }),
  setSelectedBU: (buId) => set({ selectedBUId: buId }),
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

  processKPINotification: (kpi, oldStatus, isRetroactive) => {
    // Notification logic implementation
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
}))
