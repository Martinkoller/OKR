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
import { isSameDay, parseISO } from 'date-fns'

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
    referenceDate?: string, // New parameter
  ) => void

  deleteKPIMeasurement: (
    kpiId: string,
    timestamp: string, // Identifier for the history entry
    userId: string,
  ) => void

  updateOKR: (okr: OKR, userId: string) => void

  saveActionPlan: (plan: ActionPlan, userId: string) => void
  addAuditEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void
  addOKR: (okr: OKR, userId: string) => void
  addKPI: (kpi: KPI, userId: string) => void

  // Deletion Actions (Updated for Soft Delete)
  deleteOKR: (okrId: string, userId: string) => void
  deleteKPI: (kpiId: string, userId: string) => void

  // Restore Actions
  restoreOKR: (okrId: string, userId: string) => void
  restoreKPI: (kpiId: string, userId: string) => void

  // Template Management
  addTemplate: (template: Template, userId: string) => void
  updateTemplate: (template: Template, userId: string) => void
  deleteTemplate: (templateId: string, userId: string) => void
}

export const useDataStore = create<DataState>((set, get) => ({
  okrs: MOCK_OKRS,
  kpis: MOCK_KPIS,
  actionPlans: MOCK_ACTION_PLANS,
  auditLogs: MOCK_AUDIT_LOGS,
  templates: MOCK_TEMPLATES,

  updateKPI: (
    kpiId,
    value,
    userId,
    comment,
    isRetroactive,
    reason,
    referenceDate,
  ) => {
    set((state) => {
      const kpiIndex = state.kpis.findIndex((k) => k.id === kpiId)
      if (kpiIndex === -1) return state

      const oldKPI = state.kpis[kpiIndex]
      const oldStatus = oldKPI.status

      const entryDate = referenceDate || new Date().toISOString()

      const newHistoryEntry: KPIHistoryEntry = {
        date: entryDate,
        value,
        comment,
        updatedByUserId: userId,
        timestamp: new Date().toISOString(),
      }

      // Merge history: if entry exists for same day, replace it (upsert)
      let newHistory = [...oldKPI.history]
      const existingEntryIndex = newHistory.findIndex((h) =>
        isSameDay(parseISO(h.date), parseISO(entryDate)),
      )

      if (existingEntryIndex >= 0) {
        newHistory[existingEntryIndex] = {
          ...newHistoryEntry,
          // Keep original timestamp if updating? No, update timestamp to now
          timestamp: new Date().toISOString(),
        }
      } else {
        newHistory.push(newHistoryEntry)
      }

      // Sort history to find latest
      newHistory.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      )

      const latestEntry = newHistory[newHistory.length - 1]
      const newValue = latestEntry.value
      const newStatus = calculateStatus(newValue, oldKPI.goal)

      const updatedKPI = {
        ...oldKPI,
        currentValue: newValue,
        status: newStatus,
        lastUpdated: new Date().toISOString(),
        history: newHistory,
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
        newValue: newValue,
        reason: isRetroactive ? reason : comment || 'Atualização de valor',
        userId,
        timestamp: new Date().toISOString(),
        details: referenceDate
          ? `Data de Referência: ${referenceDate}`
          : undefined,
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
          .processNotification(updatedKPI, 'KPI', oldStatus, !!isRetroactive)
      }, 0)

      return {
        kpis: newKPIs,
        okrs: newOKRs,
        auditLogs: [auditEntry, ...state.auditLogs],
      }
    })
  },

  deleteKPIMeasurement: (kpiId, timestamp, userId) => {
    set((state) => {
      const kpiIndex = state.kpis.findIndex((k) => k.id === kpiId)
      if (kpiIndex === -1) return state

      const oldKPI = state.kpis[kpiIndex]

      // Find the entry to delete for audit log
      const entryToDelete = oldKPI.history.find(
        (h) => h.timestamp === timestamp,
      )
      if (!entryToDelete) return state

      // Filter out
      const newHistory = oldKPI.history.filter((h) => h.timestamp !== timestamp)

      // Recalculate state
      let newValue = 0
      let newStatus: KPIStatus = 'RED'

      if (newHistory.length > 0) {
        newHistory.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )
        const latest = newHistory[newHistory.length - 1]
        newValue = latest.value
        newStatus = calculateStatus(newValue, oldKPI.goal)
      }

      const updatedKPI = {
        ...oldKPI,
        currentValue: newValue,
        status: newStatus,
        history: newHistory,
        lastUpdated: new Date().toISOString(),
      }

      const newKPIs = [...state.kpis]
      newKPIs[kpiIndex] = updatedKPI

      const auditEntry: AuditEntry = {
        id: Math.random().toString(36).substr(2, 9),
        entityId: kpiId,
        entityType: 'KPI',
        action: 'DELETE',
        field: 'history',
        oldValue: entryToDelete.value,
        newValue: 'DELETED',
        reason: 'Remoção de medição',
        userId,
        timestamp: new Date().toISOString(),
        details: `Medição de ${entryToDelete.date} removida.`,
      }

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

  updateOKR: (okr, userId) => {
    set((state) => {
      const oldOKR = state.okrs.find((o) => o.id === okr.id)
      const oldProgress = oldOKR?.progress
      const oldStatus = oldOKR?.status

      // Calculate progress and status based on current KPIs (in case kpiIds changed)
      const { progress, status } = calculateOKRProgress(okr, state.kpis)
      const updatedOKR = { ...okr, progress, status }

      const newOKRs = state.okrs.map((o) => (o.id === okr.id ? updatedOKR : o))

      const auditEntry: AuditEntry = {
        id: Math.random().toString(36).substr(2, 9),
        entityId: okr.id,
        entityType: 'OKR',
        action: 'UPDATE',
        field: 'progress',
        oldValue: oldProgress,
        newValue: progress,
        reason: `Atualização de OKR: ${okr.title}`,
        userId,
        timestamp: new Date().toISOString(),
      }

      // Trigger Notification Engine for OKR
      setTimeout(() => {
        useUserStore
          .getState()
          .processNotification(updatedOKR, 'OKR', oldStatus || '', false)
      }, 0)

      return {
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
      // Calculate initial progress based on linked KPIs
      const { progress, status } = calculateOKRProgress(okr, state.kpis)
      const newOKR = { ...okr, progress, status }

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
        okrs: [...state.okrs, newOKR],
        auditLogs: [auditEntry, ...state.auditLogs],
      }
    })
  },

  // Soft Delete OKR
  deleteOKR: (okrId, userId) => {
    set((state) => {
      const okrToDelete = state.okrs.find((o) => o.id === okrId)
      if (!okrToDelete) return state

      const updatedOKR = { ...okrToDelete, deletedAt: new Date().toISOString() }

      const auditEntry: AuditEntry = {
        id: Math.random().toString(36).substr(2, 9),
        entityId: okrId,
        entityType: 'OKR',
        action: 'DELETE',
        reason: `Exclusão de OKR: ${okrToDelete.title}`,
        userId,
        timestamp: new Date().toISOString(),
        details: 'OKR movido para a Lixeira (Soft Delete)',
      }

      // Trigger Notification
      setTimeout(() => {
        useUserStore
          .getState()
          .notifyDeletion(okrToDelete.title, 'OKR', userId, okrToDelete.ownerId)
      }, 0)

      return {
        okrs: state.okrs.map((o) => (o.id === okrId ? updatedOKR : o)),
        auditLogs: [auditEntry, ...state.auditLogs],
      }
    })
  },

  // Soft Delete KPI
  deleteKPI: (kpiId, userId) => {
    set((state) => {
      const kpiToDelete = state.kpis.find((k) => k.id === kpiId)
      if (!kpiToDelete) return state

      const updatedKPI = { ...kpiToDelete, deletedAt: new Date().toISOString() }

      const auditEntry: AuditEntry = {
        id: Math.random().toString(36).substr(2, 9),
        entityId: kpiId,
        entityType: 'KPI',
        action: 'DELETE',
        reason: `Exclusão de KPI: ${kpiToDelete.name}`,
        userId,
        timestamp: new Date().toISOString(),
        details: 'KPI movido para a Lixeira (Soft Delete)',
      }

      // Recalculate OKRs without this KPI (effectively treating it as removed for calc)
      // Note: We keep the ID in kpiIds, but since calculateOKRProgress filters KPIs,
      // we need to make sure we pass only active KPIs or modify calculation logic.
      // Currently calculateOKRProgress uses `kpis`. We should update `kpis` first.

      const newKPIs = state.kpis.map((k) => (k.id === kpiId ? updatedKPI : k))

      // We should probably exclude deleted KPIs from OKR calculation
      const activeKPIs = newKPIs.filter((k) => !k.deletedAt)

      const newOKRs = state.okrs.map((okr) => {
        if (okr.kpiIds.includes(kpiId)) {
          const { progress, status } = calculateOKRProgress(okr, activeKPIs)
          return { ...okr, progress, status }
        }
        return okr
      })

      // Trigger Notification
      setTimeout(() => {
        useUserStore
          .getState()
          .notifyDeletion(kpiToDelete.name, 'KPI', userId, kpiToDelete.ownerId)
      }, 0)

      return {
        kpis: newKPIs,
        okrs: newOKRs,
        auditLogs: [auditEntry, ...state.auditLogs],
      }
    })
  },

  restoreOKR: (okrId, userId) => {
    set((state) => {
      const okrToRestore = state.okrs.find((o) => o.id === okrId)
      if (!okrToRestore || !okrToRestore.deletedAt) return state

      const updatedOKR = { ...okrToRestore, deletedAt: undefined }

      const auditEntry: AuditEntry = {
        id: Math.random().toString(36).substr(2, 9),
        entityId: okrId,
        entityType: 'OKR',
        action: 'RESTORE',
        reason: `Restauração de OKR: ${okrToRestore.title}`,
        userId,
        timestamp: new Date().toISOString(),
        details: 'Registro restaurado da lixeira.',
      }

      return {
        okrs: state.okrs.map((o) => (o.id === okrId ? updatedOKR : o)),
        auditLogs: [auditEntry, ...state.auditLogs],
      }
    })
  },

  restoreKPI: (kpiId, userId) => {
    set((state) => {
      const kpiToRestore = state.kpis.find((k) => k.id === kpiId)
      if (!kpiToRestore || !kpiToRestore.deletedAt) return state

      const updatedKPI = { ...kpiToRestore, deletedAt: undefined }

      const newKPIs = state.kpis.map((k) => (k.id === kpiId ? updatedKPI : k))

      // Recalculate linked OKRs
      const activeKPIs = newKPIs.filter((k) => !k.deletedAt)
      const newOKRs = state.okrs.map((okr) => {
        if (okr.kpiIds.includes(kpiId)) {
          const { progress, status } = calculateOKRProgress(okr, activeKPIs)
          return { ...okr, progress, status }
        }
        return okr
      })

      const auditEntry: AuditEntry = {
        id: Math.random().toString(36).substr(2, 9),
        entityId: kpiId,
        entityType: 'KPI',
        action: 'RESTORE',
        reason: `Restauração de KPI: ${kpiToRestore.name}`,
        userId,
        timestamp: new Date().toISOString(),
        details: 'Registro restaurado da lixeira.',
      }

      return {
        kpis: newKPIs,
        okrs: newOKRs,
        auditLogs: [auditEntry, ...state.auditLogs],
      }
    })
  },

  addTemplate: (template, userId) =>
    set((state) => {
      const auditEntry: AuditEntry = {
        id: Math.random().toString(36).substr(2, 9),
        entityId: template.id,
        entityType: 'TEMPLATE',
        action: 'CREATE',
        reason: `Modelo criado: ${template.title}`,
        userId,
        timestamp: new Date().toISOString(),
      }
      return {
        templates: [...state.templates, template],
        auditLogs: [auditEntry, ...state.auditLogs],
      }
    }),

  updateTemplate: (template, userId) =>
    set((state) => {
      const auditEntry: AuditEntry = {
        id: Math.random().toString(36).substr(2, 9),
        entityId: template.id,
        entityType: 'TEMPLATE',
        action: 'UPDATE',
        reason: `Modelo atualizado: ${template.title}`,
        userId,
        timestamp: new Date().toISOString(),
      }
      return {
        templates: state.templates.map((t) =>
          t.id === template.id ? template : t,
        ),
        auditLogs: [auditEntry, ...state.auditLogs],
      }
    }),

  deleteTemplate: (templateId, userId) =>
    set((state) => {
      const auditEntry: AuditEntry = {
        id: Math.random().toString(36).substr(2, 9),
        entityId: templateId,
        entityType: 'TEMPLATE',
        action: 'DELETE',
        reason: 'Modelo excluído',
        userId,
        timestamp: new Date().toISOString(),
      }
      return {
        templates: state.templates.filter((t) => t.id !== templateId),
        auditLogs: [auditEntry, ...state.auditLogs],
      }
    }),
}))
