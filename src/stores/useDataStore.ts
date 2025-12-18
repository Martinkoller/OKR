import { create } from 'zustand'
import {
  OKR,
  KPI,
  AuditEntry,
  KPIStatus,
  KPIHistoryEntry,
  ActionPlan,
  Template,
} from '@/types'
import {
  MOCK_KPIS,
  MOCK_OKRS,
  MOCK_ACTION_PLANS,
  MOCK_AUDIT_LOGS,
  MOCK_TEMPLATES,
} from '@/data/mockData'
import { calculateStatus, calculateOKRProgress } from '@/lib/kpi-utils'
import { useUserStore } from '@/stores/useUserStore'

interface DataState {
  okrs: OKR[]
  kpis: KPI[]
  actionPlans: ActionPlan[]
  auditLogs: AuditEntry[]
  templates: Template[]

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
  addOKR: (okr: OKR, userId: string) => void
  addKPI: (kpi: KPI, userId: string) => void
}

export const useDataStore = create<DataState>((set) => ({
  okrs: MOCK_OKRS,
  kpis: MOCK_KPIS,
  actionPlans: MOCK_ACTION_PLANS,
  auditLogs: MOCK_AUDIT_LOGS,
  templates: MOCK_TEMPLATES,

  updateKPI: (kpiId, value, userId, comment, isRetroactive, reason) => {
    set((state) => {
      const kpiIndex = state.kpis.findIndex((k) => k.id === kpiId)
      if (kpiIndex === -1) return state

      const oldKPI = state.kpis[kpiIndex]
      const oldStatus = oldKPI.status
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

      const newOKRs = state.okrs.map((okr) => {
        if (okr.kpiIds.includes(kpiId)) {
          const { progress, status } = calculateOKRProgress(okr, newKPIs)
          return { ...okr, progress, status }
        }
        return okr
      })

      // Trigger Notification Engine
      setTimeout(() => {
        useUserStore
          .getState()
          .processKPINotification(updatedKPI, oldStatus, !!isRetroactive)
      }, 0)

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
      let newValue: string | number = plan.status

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
        reason: action === 'CREATE' ? 'Criação' : 'Atualização',
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

  addOKR: (okr, userId) => {
    set((state) => {
      const auditEntry: AuditEntry = {
        id: Math.random().toString(36).substr(2, 9),
        entityId: okr.id,
        entityType: 'OKR',
        action: 'CREATE',
        reason: `Criação de OKR: ${okr.title}`,
        userId,
        timestamp: new Date().toISOString(),
      }

      return {
        okrs: [...state.okrs, okr],
        auditLogs: [auditEntry, ...state.auditLogs],
      }
    })
  },

  addKPI: (kpi, userId) => {
    set((state) => {
      const auditEntry: AuditEntry = {
        id: Math.random().toString(36).substr(2, 9),
        entityId: kpi.id,
        entityType: 'KPI',
        action: 'CREATE',
        reason: `Criação de KPI: ${kpi.name}`,
        userId,
        timestamp: new Date().toISOString(),
      }

      return {
        kpis: [...state.kpis, kpi],
        auditLogs: [auditEntry, ...state.auditLogs],
      }
    })
  },
}))
