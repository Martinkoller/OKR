import { create } from 'zustand'
import { User, BU } from '@/types'
import { MOCK_BUS, MOCK_USERS } from '@/data/mockData'

interface UserState {
  currentUser: User | null
  selectedBUId: string | 'GLOBAL'
  bus: BU[]
  users: User[]
  notifications: Array<{
    id: string
    title: string
    message: string
    read: boolean
  }>

  setCurrentUser: (user: User) => void
  setSelectedBU: (buId: string | 'GLOBAL') => void
  addNotification: (title: string, message: string) => void
  markNotificationAsRead: (id: string) => void
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: MOCK_USERS[0],
  selectedBUId: 'GLOBAL',
  bus: MOCK_BUS,
  users: MOCK_USERS,
  notifications: [
    {
      id: '1',
      title: 'KPI Crítico no RH',
      message: 'O KPI "Tempo Médio de Contratação" excedeu o limite.',
      read: false,
    },
  ],

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
}))
