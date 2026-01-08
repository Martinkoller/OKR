import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, BU, NotificationRule, ActionPlan } from '@/types'
import { MOCK_BUS, MOCK_USERS, MOCK_ROLES, MOCK_GROUPS } from '@/data/mockData'
import { profileService } from '@/services/profileService'
import { onboardingService } from '@/services/onboardingService'

interface UserState {
  isAuthenticated: boolean
  currentUser: User | null
  selectedBUIds: string[]
  bus: BU[]
  users: User[]
  roles: any[]
  groups: any[]
  notifications: any[]
  alerts: any[]
  notificationRules: NotificationRule[]
  dashboardConfigs: any
  biConfig: any
  hasSeenOnboarding: boolean
  isOnboardingChecked: boolean

  // Actions
  login: (email: string) => boolean
  logout: () => void
  fetchProfiles: () => Promise<void>
  checkOnboarding: (userId: string) => Promise<void>
  completeOnboarding: () => Promise<void>

  // Other methods
  scanForTaskDeadlines: (actionPlans: ActionPlan[]) => void
  isGlobalView: () => boolean
  setSelectedBUs: (buIds: string[]) => void
  getAllAccessibleBUIds: (userId: string) => string[]

  // Placeholders for compatibility
  addNotification: (title: string, message: string) => void
  markNotificationAsRead: (id: string) => void
  markAlertAsRead: (id: string) => void
  triggerSecurityAlert: () => void
  addTaskAlert: () => void
  notifyDeletion: () => void
  addUser: (user: User) => void
  updateUser: (user: User) => void
  deleteUser: (userId: string) => void
  addRole: (role: any) => void
  updateRole: (role: any) => void
  deleteRole: (roleId: string) => void
  addGroup: (group: any) => void
  updateGroup: (group: any) => void
  deleteGroup: (groupId: string) => void
  addBU: (bu: BU) => void
  updateBU: (bu: BU) => void
  deleteBU: (buId: string) => void
  updateBURoles: (buId: string, roleIds: string[]) => void
  addRule: (rule: NotificationRule) => void
  updateRule: (rule: NotificationRule) => void
  deleteRule: (ruleId: string) => void
  processNotification: () => void
  updateBIConfig: (config: any) => void
  setCurrentUser: (user: User) => void
  setDashboardConfig: (config: any) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      currentUser: null,
      selectedBUIds: ['GLOBAL'],
      bus: MOCK_BUS,
      users: MOCK_USERS,
      roles: MOCK_ROLES,
      groups: MOCK_GROUPS,
      notifications: [],
      alerts: [],
      notificationRules: [],
      dashboardConfigs: {},
      biConfig: {
        provider: 'POWER_BI',
        enabled: false,
        updatedAt: '',
        updatedBy: '',
      },
      hasSeenOnboarding: false,
      isOnboardingChecked: false,

      login: (email) => {
        // In real app, this is handled by Supabase Auth Provider logic in App.tsx/Layout.tsx
        // keeping mock logic for compatibility with existing flow if needed,
        // but primarily we rely on external Auth Provider state syncing.
        const user = get().users.find((u) => u.email === email)
        if (user) {
          set({ currentUser: user, isAuthenticated: true })
          return true
        }
        return true // Allow login for non-mock users (Supabase users)
      },

      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
          isOnboardingChecked: false,
        })
      },

      fetchProfiles: async () => {
        try {
          const profiles = await profileService.fetchProfiles()
          set((state) => {
            // Merge profiles with existing mock users structure
            // In a full migration, MOCK_USERS would be replaced entirely.
            // Here we update names based on ID match or add new ones.
            const updatedUsers = state.users.map((u) => {
              const profile = profiles.find((p) => p.id === u.id)
              return profile ? { ...u, name: profile.name || u.name } : u
            })
            return { users: updatedUsers }
          })
        } catch (e) {
          console.error('Error fetching profiles', e)
        }
      },

      checkOnboarding: async (userId) => {
        try {
          const completed = await onboardingService.getStatus(userId)
          set({ hasSeenOnboarding: completed, isOnboardingChecked: true })
        } catch (error) {
          console.error('Error checking onboarding status:', error)
          // Ensure we don't block the app if check fails, but assume not seen to be safe or true to not annoy?
          // Let's allow retry by NOT setting checked if strictly needed,
          // but better to set checked=true and hasSeen=false so modal might appear but allow close.
          // However, onboardingService.getStatus returns false on error typically.
          set({ hasSeenOnboarding: false, isOnboardingChecked: true })
        }
      },

      completeOnboarding: async () => {
        const { currentUser } = get()
        if (currentUser) {
          await onboardingService.setCompleted(currentUser.id)
          set({ hasSeenOnboarding: true })
        }
      },

      // ... Keep existing methods strictly as is ...
      setSelectedBUs: (buIds) => set({ selectedBUIds: buIds }),
      isGlobalView: () => get().selectedBUIds.includes('GLOBAL'),
      getAllAccessibleBUIds: (userId) => {
        // Mock logic
        return ['GLOBAL', 'bu-1', 'bu-2', 'bu-3', 'bu-4', 'bu-5', 'bu-6']
      },
      scanForTaskDeadlines: () => {},
      addNotification: () => {},
      markNotificationAsRead: () => {},
      markAlertAsRead: () => {},
      triggerSecurityAlert: () => {},
      addTaskAlert: () => {},
      notifyDeletion: () => {},
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: (user) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === user.id ? user : u)),
        })),
      deleteUser: (userId) =>
        set((state) => ({ users: state.users.filter((u) => u.id !== userId) })),
      addRole: (role) => set((state) => ({ roles: [...state.roles, role] })),
      updateRole: (role) =>
        set((state) => ({
          roles: state.roles.map((r) => (r.id === role.id ? role : r)),
        })),
      deleteRole: (roleId) =>
        set((state) => ({ roles: state.roles.filter((r) => r.id !== roleId) })),
      addGroup: (group) =>
        set((state) => ({ groups: [...state.groups, group] })),
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
        set((state) => ({ bus: state.bus.filter((b) => b.id !== buId) })),
      updateBURoles: () => {},
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
          notificationRules: state.notificationRules.filter(
            (r) => r.id !== ruleId,
          ),
        })),
      processNotification: () => {},
      updateBIConfig: (config) => set({ biConfig: config }),
      setCurrentUser: (user) => set({ currentUser: user }),
      setDashboardConfig: () => {},
    }),
    {
      name: 'stratmanager-user-storage',
      partialize: (state) => ({
        // Don't persist things that should be fresh
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        selectedBUIds: state.selectedBUIds,
      }),
    },
  ),
)
