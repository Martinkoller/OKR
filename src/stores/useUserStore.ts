import { create } from 'zustand'
import { User, BU, Role } from '@/types'

// Mock Data
const MOCK_BUS: BU[] = [
  { id: 'bu-1', name: 'Varejo', slug: 'varejo' },
  { id: 'bu-2', name: 'RH', slug: 'rh' },
  { id: 'bu-3', name: 'ERP', slug: 'erp' },
  { id: 'bu-4', name: 'Logística', slug: 'logistica' },
]

const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Carlos Mendes',
    email: 'carlos.mendes@zucchetti.com.br',
    role: 'GPM',
    buIds: ['bu-1', 'bu-2', 'bu-3', 'bu-4'],
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=male&seed=1',
  },
  {
    id: 'user-2',
    name: 'Ana Silva',
    email: 'ana.silva@zucchetti.com.br',
    role: 'PM',
    buIds: ['bu-1'],
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=female&seed=2',
  },
  {
    id: 'user-3',
    name: 'Roberto Souza',
    email: 'roberto.souza@zucchetti.com.br',
    role: 'DIRECTOR_BU',
    buIds: ['bu-1'],
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=male&seed=3',
  },
  {
    id: 'user-4',
    name: 'Fernanda Lima',
    email: 'fernanda.lima@zucchetti.com.br',
    role: 'DIRECTOR_GENERAL',
    buIds: [],
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=female&seed=4',
  },
]

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
      title: 'KPI Crítico',
      message: 'O KPI "Churn Rate" entrou em estado crítico.',
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
