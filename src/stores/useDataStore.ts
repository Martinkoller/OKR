import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { OKR, KPI, AuditEntry, ActionPlan, Template } from '@/types'
import {
  MOCK_ACTION_PLANS,
  MOCK_AUDIT_LOGS,
  MOCK_TEMPLATES,
} from '@/data/mockData'
import { calculateOKRProgress } from '@/lib/kpi-utils'
import { kpiService } from '@/services/kpiService'
import { okrService } from '@/services/okrService'

interface DataState {
  okrs: OKR[]
  kpis: KPI[]
  actionPlans: ActionPlan[]
  auditLogs: AuditEntry[]
  templates: Template[]
  isLoading: boolean

  fetchKPIs: () => Promise<void>
  fetchOKRs: () => Promise<void>

  updateKPI: (
    kpiId: string,
    value: number,
    userId: string,
    comment?: string,
    isRetroactive?: boolean,
    reason?: string,
    referenceDate?: string,
  ) => Promise<void>

  deleteKPIMeasurement: (
    kpiId: string,
    timestamp: string,
    userId: string,
  ) => void

  updateOKR: (okr: OKR, userId: string) => Promise<void>

  saveActionPlan: (plan: ActionPlan, userId: string) => void
  deleteActionPlan: (planId: string, userId: string) => void

  addAuditEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void
  addOKR: (okr: OKR, userId: string) => Promise<void>
  addKPI: (kpi: KPI, userId: string) => Promise<void>

  deleteOKR: (okrId: string, userId: string) => Promise<void>
  deleteKPI: (kpiId: string, userId: string) => Promise<void>

  restoreOKR: (okrId: string, userId: string) => void
  restoreKPI: (kpiId: string, userId: string) => void

  addTemplate: (template: Template, userId: string) => void
  updateTemplate: (template: Template, userId: string) => void
  deleteTemplate: (templateId: string, userId: string) => void
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      okrs: [],
      kpis: [],
      actionPlans: MOCK_ACTION_PLANS,
      auditLogs: MOCK_AUDIT_LOGS,
      templates: MOCK_TEMPLATES,
      isLoading: false,

      fetchKPIs: async () => {
        set({ isLoading: true })
        try {
          const kpis = await kpiService.fetchKPIs()
          set({ kpis })
        } catch (error) {
          console.error('Failed to fetch KPIs:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      fetchOKRs: async () => {
        set({ isLoading: true })
        try {
          const okrs = await okrService.fetchOKRs()
          set({ okrs })
        } catch (error) {
          console.error('Failed to fetch OKRs:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      updateKPI: async (
        kpiId,
        value,
        userId,
        comment,
        isRetroactive,
        reason,
        referenceDate,
      ) => {
        const date = referenceDate || new Date().toISOString()
        try {
          await kpiService.addMeasurement(kpiId, value, userId, date, comment)
          await get().fetchKPIs()
          get().addAuditEntry({
            entityId: kpiId,
            entityType: 'KPI',
            action: 'UPDATE',
            field: 'value',
            newValue: value,
            reason: comment || 'Update',
            userId,
          })
        } catch (error) {
          console.error('Failed to update KPI:', error)
        }
      },

      addKPI: async (kpi, userId) => {
        try {
          await kpiService.createKPI(kpi, userId)
          await get().fetchKPIs()
          get().addAuditEntry({
            entityId: kpi.id,
            entityType: 'KPI',
            action: 'CREATE',
            reason: `KPI Created: ${kpi.name}`,
            userId,
          })
        } catch (error) {
          console.error('Failed to create KPI:', error)
        }
      },

      deleteKPI: async (kpiId, userId) => {
        try {
          await kpiService.deleteKPI(kpiId)
          await get().fetchKPIs()
          get().addAuditEntry({
            entityId: kpiId,
            entityType: 'KPI',
            action: 'DELETE',
            reason: 'KPI Deleted',
            userId,
          })
        } catch (error) {
          console.error('Failed to delete KPI:', error)
        }
      },

      deleteKPIMeasurement: (kpiId, timestamp, userId) => {
        console.log('Delete measurement not fully implemented in DB layer yet')
      },

      updateOKR: async (okr, userId) => {
        try {
          // Progress calculation is usually done server side or derived, but if we do it here:
          const { progress, status } = calculateOKRProgress(okr, get().kpis)
          const okrToUpdate = { ...okr, progress, status }

          await okrService.updateOKR(okrToUpdate)
          await get().fetchOKRs()

          get().addAuditEntry({
            entityId: okr.id,
            entityType: 'OKR',
            action: 'UPDATE',
            reason: `Atualização de OKR: ${okr.title}`,
            userId,
          })
        } catch (error) {
          console.error('Failed to update OKR', error)
        }
      },

      addOKR: async (okr, userId) => {
        try {
          await okrService.createOKR(okr)
          await get().fetchOKRs()
          get().addAuditEntry({
            entityId: okr.id,
            entityType: 'OKR',
            action: 'CREATE',
            reason: `OKR Created: ${okr.title}`,
            userId,
          })
        } catch (error) {
          console.error('Failed to create OKR', error)
        }
      },

      deleteOKR: async (okrId, userId) => {
        try {
          await okrService.deleteOKR(okrId)
          await get().fetchOKRs()
          get().addAuditEntry({
            entityId: okrId,
            entityType: 'OKR',
            action: 'DELETE',
            reason: 'OKR Deleted',
            userId,
          })
        } catch (error) {
          console.error('Failed to delete OKR', error)
        }
      },

      saveActionPlan: (plan, userId) => {
        set((state) => {
          const existingIndex = state.actionPlans.findIndex(
            (p) => p.id === plan.id,
          )
          let newPlans = [...state.actionPlans]
          if (existingIndex >= 0) {
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
          return { actionPlans: newPlans }
        })
      },

      deleteActionPlan: (planId, userId) => {
        set((state) => ({
          actionPlans: state.actionPlans.filter((p) => p.id !== planId),
        }))
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

      restoreOKR: (okrId, userId) => {},
      restoreKPI: (kpiId, userId) => {},

      addTemplate: (template, userId) =>
        set((state) => ({ templates: [...state.templates, template] })),
      updateTemplate: (template, userId) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === template.id ? template : t,
          ),
        })),
      deleteTemplate: (templateId, userId) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== templateId),
        })),
    }),
    {
      name: 'stratmanager-data-storage',
      partialize: (state) => ({
        // Don't persist fetched data to ensure freshness on load
        actionPlans: state.actionPlans,
        auditLogs: state.auditLogs,
        templates: state.templates,
      }),
    },
  ),
)
