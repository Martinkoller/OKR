import { create } from 'zustand'
import {
  OKR,
  KPI,
  AuditEntry,
  KPIStatus,
  KPIHistoryEntry,
  ActionPlan,
  ActionPlanTask,
  ActionPlanStatus,
} from '@/types'

// Helpers
const calculateStatus = (value: number, goal: number): KPIStatus => {
  if (goal === 0) return 'GREEN' // Avoid division by zero
  const percentage = value / goal
  if (percentage >= 1) return 'GREEN'
  if (percentage >= 0.9) return 'YELLOW'
  return 'RED'
}

const calculateOKRProgress = (
  okr: OKR,
  kpis: KPI[],
): { progress: number; status: KPIStatus } => {
  const linkedKPIs = kpis.filter((k) => okr.kpiIds.includes(k.id))
  if (linkedKPIs.length === 0) return { progress: 0, status: 'RED' }

  let totalWeight = 0
  let weightedProgress = 0

  linkedKPIs.forEach((kpi) => {
    totalWeight += kpi.weight
    const kpiProgress = Math.min((kpi.currentValue / kpi.goal) * 100, 100) // Cap at 100% for calculation
    weightedProgress += kpiProgress * kpi.weight
  })

  const finalProgress = totalWeight > 0 ? weightedProgress / totalWeight : 0

  let status: KPIStatus = 'RED'
  if (finalProgress >= 100) status = 'GREEN'
  else if (finalProgress >= 90) status = 'YELLOW'

  return { progress: Math.round(finalProgress), status }
}

// Mock Data
const INITIAL_KPIs: KPI[] = [
  {
    id: 'kpi-1',
    name: 'Receita Recorrente Mensal (MRR)',
    description: 'Soma de todas as receitas recorrentes',
    buId: 'bu-1',
    ownerId: 'user-1',
    frequency: 'MONTHLY',
    type: 'QUANT',
    unit: 'R$',
    goal: 1000000,
    weight: 40,
    currentValue: 950000,
    status: 'YELLOW',
    lastUpdated: new Date().toISOString(),
    history: [],
  },
  {
    id: 'kpi-2',
    name: 'NPS Global',
    description: 'Net Promoter Score medido mensalmente',
    buId: 'bu-1',
    ownerId: 'user-1',
    frequency: 'MONTHLY',
    type: 'QUAL',
    unit: 'pts',
    goal: 75,
    weight: 30,
    currentValue: 80,
    status: 'GREEN',
    lastUpdated: new Date().toISOString(),
    history: [],
  },
  {
    id: 'kpi-3',
    name: 'Churn Rate',
    description: 'Taxa de cancelamento de clientes',
    buId: 'bu-1',
    ownerId: 'user-1',
    frequency: 'MONTHLY',
    type: 'QUANT',
    unit: '%',
    goal: 5,
    weight: 30,
    currentValue: 4,
    status: 'RED',
    lastUpdated: new Date().toISOString(),
    history: [],
  },
]

const INITIAL_OKRS: OKR[] = [
  {
    id: 'okr-1',
    title: 'Dominar o mercado de Varejo no Sul',
    description: 'Expandir presença e fidelizar base instalada',
    buId: 'bu-1',
    year: 2024,
    weight: 1, // High Priority
    ownerId: 'user-1',
    kpiIds: ['kpi-1', 'kpi-2', 'kpi-3'],
    progress: 85,
    status: 'YELLOW',
  },
  {
    id: 'okr-2',
    title: 'Excelência Operacional em RH',
    description: 'Otimizar processos internos',
    buId: 'bu-2',
    year: 2024,
    weight: 2,
    ownerId: 'user-1',
    kpiIds: [],
    progress: 60,
    status: 'RED',
  },
]

const INITIAL_ACTION_PLANS: ActionPlan[] = [
  {
    id: 'ap-1',
    title: 'Recuperação de Churn',
    description:
      'Plano intensivo para retenção de clientes na base com risco de cancelamento.',
    entityId: 'kpi-3',
    entityType: 'KPI',
    status: 'IN_PROGRESS',
    dueDate: '2024-12-31',
    ownerId: 'user-1',
    tasks: [
      {
        id: 't-1',
        description: 'Mapear clientes com risco > 80%',
        ownerId: 'user-2',
        deadline: '2024-10-15',
        status: 'DONE',
      },
      {
        id: 't-2',
        description: 'Ligar para top 20 clientes em risco',
        ownerId: 'user-1',
        deadline: '2024-10-30',
        status: 'PENDING',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

interface DataState {
  okrs: OKR[]
  kpis: KPI[]
  actionPlans: ActionPlan[]
  auditLogs: AuditEntry[]

  updateKPI: (
    kpiId: string,
    value: number,
    userId: string,
    comment?: string,
    isRetroactive?: boolean,
    reason?: string,
  ) => void

  saveActionPlan: (plan: ActionPlan, userId: string) => void
  addAuditEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void
}

export const useDataStore = create<DataState>((set) => ({
  okrs: INITIAL_OKRS,
  kpis: INITIAL_KPIs,
  actionPlans: INITIAL_ACTION_PLANS,
  auditLogs: [
    {
      id: 'log-1',
      entityId: 'kpi-1',
      entityType: 'KPI',
      action: 'UPDATE',
      field: 'currentValue',
      oldValue: 900000,
      newValue: 950000,
      reason: 'Atualização mensal regular',
      userId: 'user-1',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  ],

  updateKPI: (kpiId, value, userId, comment, isRetroactive, reason) => {
    set((state) => {
      const kpiIndex = state.kpis.findIndex((k) => k.id === kpiId)
      if (kpiIndex === -1) return state

      const oldKPI = state.kpis[kpiIndex]
      const newStatus = calculateStatus(value, oldKPI.goal)

      const newHistoryEntry: KPIHistoryEntry = {
        date: new Date().toISOString(),
        value,
        comment,
        updatedByUserId: userId,
        timestamp: new Date().toISOString(),
      }

      const updatedKPI = {
        ...oldKPI,
        currentValue: value,
        status: newStatus,
        lastUpdated: new Date().toISOString(),
        history: [...oldKPI.history, newHistoryEntry],
      }

      const newKPIs = [...state.kpis]
      newKPIs[kpiIndex] = updatedKPI

      // Audit Log
      const auditEntry: AuditEntry = {
        id: Math.random().toString(36).substr(2, 9),
        entityId: kpiId,
        entityType: 'KPI',
        action: 'UPDATE',
        field: 'value',
        oldValue: oldKPI.currentValue,
        newValue: value,
        reason: isRetroactive ? reason : comment || 'Atualização de valor',
        userId,
        timestamp: new Date().toISOString(),
      }

      // Update Linked OKRs
      const newOKRs = state.okrs.map((okr) => {
        if (okr.kpiIds.includes(kpiId)) {
          const { progress, status } = calculateOKRProgress(okr, newKPIs)
          return { ...okr, progress, status }
        }
        return okr
      })

      return {
        kpis: newKPIs,
        okrs: newOKRs,
        auditLogs: [auditEntry, ...state.auditLogs],
      }
    })
  },

  saveActionPlan: (plan, userId) => {
    set((state) => {
      const existingIndex = state.actionPlans.findIndex((p) => p.id === plan.id)
      let newPlans = [...state.actionPlans]
      let action: 'CREATE' | 'UPDATE' = 'CREATE'
      let oldValue = undefined
      let newValue = plan.status

      if (existingIndex >= 0) {
        action = 'UPDATE'
        oldValue = state.actionPlans[existingIndex].status
        newPlans[existingIndex] = {
          ...plan,
          updatedAt: new Date().toISOString(),
        }
      } else {
        newPlans = [
          {
            ...plan,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          ...state.actionPlans,
        ]
      }

      const auditEntry: AuditEntry = {
        id: Math.random().toString(36).substr(2, 9),
        entityId: plan.id,
        entityType: 'ACTION_PLAN',
        action,
        field: 'status',
        oldValue,
        newValue,
        reason:
          action === 'CREATE'
            ? 'Criação de Plano de Ação'
            : 'Atualização de Plano de Ação',
        userId,
        timestamp: new Date().toISOString(),
      }

      return {
        actionPlans: newPlans,
        auditLogs: [auditEntry, ...state.auditLogs],
      }
    })
  },

  addAuditEntry: (entry) =>
    set((state) => ({
      auditLogs: [
        {
          ...entry,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
        },
        ...state.auditLogs,
      ],
    })),
}))
