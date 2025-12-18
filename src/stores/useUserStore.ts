import { create } from 'zustand'
import { User, BU, NotificationRule, KPI, RoleDefinition, Group } from '@/types'
import { MOCK_BUS, MOCK_USERS, MOCK_ROLES, MOCK_GROUPS } from '@/data/mockData'

interface UserState {
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

  // BU Management (Access)
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
  {
    id: 'rule-2',
    userId: 'u-2',
    name: 'Varejo - Mudança de Status',
    buId: 'bu-1',
    kpiType: 'QUANT',
    triggerCondition: 'STATUS_CHANGE',
    channels: ['PORTAL'],
    isActive: true,
  },
]

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: MOCK_USERS[0],
  selectedBUId: 'GLOBAL',
  bus: MOCK_BUS,
  users: MOCK_USERS,
  roles: MOCK_ROLES,
  groups: MOCK_GROUPS,
  notifications: [
    {
      id: '1',
      title: 'KPI Crítico no RH',
      message: 'O KPI "Tempo Médio de Contratação" excedeu o limite.',
      read: false,
    },
  ],
  notificationRules: MOCK_RULES,

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
      // If current user is updated, update session too
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
    const state = get()
    const activeRules = state.notificationRules.filter((r) => r.isActive)

    activeRules.forEach((rule) => {
      if (rule.buId !== 'ALL' && rule.buId !== kpi.buId) return
      if (rule.kpiType !== 'ALL' && rule.kpiType !== kpi.type) return

      let shouldNotify = false
      if (
        rule.triggerCondition === 'STATUS_RED' &&
        kpi.status === 'RED' &&
        oldStatus !== 'RED'
      ) {
        shouldNotify = true
      } else if (
        rule.triggerCondition === 'STATUS_CHANGE' &&
        kpi.status !== oldStatus
      ) {
        shouldNotify = true
      } else if (
        rule.triggerCondition === 'RETROACTIVE_EDIT' &&
        isRetroactive
      ) {
        shouldNotify = true
      }

      if (shouldNotify) {
        if (rule.channels.includes('PORTAL')) {
          if (rule.userId === state.currentUser?.id) {
            state.addNotification(
              `Alerta: ${rule.name}`,
              `O KPI "${kpi.name}" atendeu ao critério: ${rule.triggerCondition}.`,
            )
          } else {
            console.log(
              `[MOCK EMAIL SENT] To User ${rule.userId} via Rule ${rule.name} for KPI ${kpi.name}`,
            )
          }
        }
      }
    })
  },
}))
