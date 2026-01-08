import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, BU, NotificationRule, ActionPlan } from '@/types'
import { MOCK_BUS, MOCK_USERS, MOCK_ROLES, MOCK_GROUPS } from '@/data/mockData'
import { profileService } from '@/services/profileService'
import { onboardingService } from '@/services/onboardingService'
import { supabase } from '@/lib/supabase/client'

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
  authLoading: boolean

  // Actions
  login: (
    email: string,
    password?: string,
    isSignUp?: boolean,
  ) => Promise<boolean>
  logout: () => Promise<void>
  syncWithSupabase: () => Promise<void>
  fetchProfiles: () => Promise<void>
  checkOnboarding: (userId: string) => Promise<void>
  completeOnboarding: () => Promise<void>

  // Other methods
  scanForTaskDeadlines: (actionPlans: ActionPlan[]) => void
  isGlobalView: () => boolean
  setSelectedBUs: (buIds: string[]) => void
  getAllAccessibleBUIds: (userId: string) => string[]

  // Placeholders
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
      authLoading: true,

      login: async (email, password = '123', isSignUp = false) => {
        try {
          let error = null
          let data = null

          if (isSignUp) {
            const res = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  full_name: email.split('@')[0],
                },
              },
            })
            error = res.error
            data = res.data
          } else {
            const res = await supabase.auth.signInWithPassword({
              email,
              password,
            })
            error = res.error
            data = res.data
          }

          if (error) throw error

          if (data?.user) {
            // Map Supabase user to App User
            const appUser: User = {
              id: data.user.id,
              name: data.user.user_metadata.full_name || email,
              email: data.user.email || email,
              role: 'VIEWER', // Default role
              buIds: ['GLOBAL'],
              groupIds: [],
              active: true,
              avatarUrl: '',
              password: '', // Don't store
            }

            set({ currentUser: appUser, isAuthenticated: true })
            return true
          }
          return false
        } catch (e: any) {
          console.error('Login error:', e)
          throw e
        }
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({
          currentUser: null,
          isAuthenticated: false,
          isOnboardingChecked: false,
          hasSeenOnboarding: false,
        })
      },

      syncWithSupabase: async () => {
        set({ authLoading: true })
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession()
          if (session?.user) {
            const appUser: User = {
              id: session.user.id,
              name:
                session.user.user_metadata.full_name ||
                session.user.email ||
                'Usuário',
              email: session.user.email || '',
              role: 'VIEWER',
              buIds: ['GLOBAL'],
              groupIds: [],
              active: true,
              avatarUrl: '',
              password: '',
            }
            set({ currentUser: appUser, isAuthenticated: true })
            // Check onboarding immediately after sync
            get().checkOnboarding(appUser.id)
          } else {
            set({ currentUser: null, isAuthenticated: false })
          }
        } catch (error) {
          console.error('Auth sync error:', error)
          set({ currentUser: null, isAuthenticated: false })
        } finally {
          set({ authLoading: false })
        }
      },

      fetchProfiles: async () => {
        try {
          const profiles = await profileService.fetchProfiles()
          set((state) => {
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
        // Double check against real session to avoid mock ID errors
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const realUserId = session?.user?.id

        if (!realUserId) {
          // If no real session, we can't check DB accurately for RLS
          console.warn('Skipping onboarding check: No active Supabase session')
          return
        }

        try {
          const completed = await onboardingService.getStatus(realUserId)
          set({ hasSeenOnboarding: completed, isOnboardingChecked: true })
        } catch (error) {
          console.error('Error checking onboarding status:', error)
          set({ hasSeenOnboarding: false, isOnboardingChecked: true })
        }
      },

      completeOnboarding: async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const realUserId = session?.user?.id

        if (realUserId) {
          await onboardingService.setCompleted(realUserId)
          set({ hasSeenOnboarding: true })
        } else {
          throw new Error(
            'No authenticated user found for saving onboarding status',
          )
        }
      },

      // ... Keep existing methods ...
      setSelectedBUs: (buIds) => set({ selectedBUIds: buIds }),
      isGlobalView: () => get().selectedBUIds.includes('GLOBAL'),
      getAllAccessibleBUIds: (userId) => [
        'GLOBAL',
        'bu-1',
        'bu-2',
        'bu-3',
        'bu-4',
        'bu-5',
        'bu-6',
      ],
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
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        selectedBUIds: state.selectedBUIds,
      }),
    },
  ),
)
