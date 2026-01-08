import { supabase } from '@/lib/supabase/client'
import { KPI, KPIHistoryEntry } from '@/types'
import { calculateStatus } from '@/lib/kpi-utils'

export const kpiService = {
  async fetchKPIs(): Promise<KPI[]> {
    const { data: kpis, error: kpiError } = await supabase
      .from('kpis')
      .select('*')
      .is('deleted_at', null)

    if (kpiError) throw kpiError

    // Fetch measurements for history
    const { data: measurements, error: measError } = await supabase
      .from('kpi_measurements')
      .select('*')
      .order('recorded_at', { ascending: true })

    if (measError) throw measError

    // Map to frontend KPI type
    return kpis.map((k) => {
      const history: KPIHistoryEntry[] = measurements
        .filter((m) => m.kpi_id === k.id)
        .map((m) => ({
          date: m.recorded_at,
          value: Number(m.value),
          comment: m.comment,
          updatedByUserId: m.created_by,
          timestamp: m.created_at,
        }))

      // Determine current value and status from last measurement
      const lastEntry = history[history.length - 1]
      const currentValue = lastEntry ? lastEntry.value : 0
      const status = calculateStatus(currentValue, Number(k.target_value))

      return {
        id: k.id,
        name: k.name,
        description: k.description,
        frequency: k.frequency as any,
        type: (k.type as any) || 'QUANT',
        unit: k.unit,
        goal: Number(k.target_value),
        weight: Number(k.weight),
        ownerId: k.owner_id,
        buId: k.bu_id,
        currentValue,
        status,
        lastUpdated: lastEntry ? lastEntry.timestamp : k.updated_at,
        history,
      }
    })
  },

  async createKPI(kpi: Partial<KPI>, userId: string): Promise<KPI> {
    const { data, error } = await supabase
      .from('kpis')
      .insert({
        name: kpi.name,
        description: kpi.description,
        frequency: kpi.frequency,
        target_value: kpi.goal,
        unit: kpi.unit,
        owner_id: userId, // Default to creator if not specified
        bu_id: kpi.buId,
        weight: kpi.weight,
        type: kpi.type,
      })
      .select()
      .single()

    if (error) throw error

    // Return partial KPI to be refetched or merged
    return {
      ...kpi,
      id: data.id,
      ownerId: data.owner_id,
    } as KPI
  },

  async updateKPI(kpi: Partial<KPI>): Promise<void> {
    const { error } = await supabase
      .from('kpis')
      .update({
        name: kpi.name,
        description: kpi.description,
        frequency: kpi.frequency,
        target_value: kpi.goal,
        unit: kpi.unit,
        owner_id: kpi.ownerId,
        bu_id: kpi.buId,
        weight: kpi.weight,
        type: kpi.type,
        updated_at: new Date().toISOString(),
      })
      .eq('id', kpi.id)

    if (error) throw error
  },

  async addMeasurement(
    kpiId: string,
    value: number,
    userId: string,
    date: string,
    comment?: string,
  ): Promise<void> {
    const { error } = await supabase.from('kpi_measurements').insert({
      kpi_id: kpiId,
      value,
      recorded_at: date,
      comment,
      created_by: userId,
    })

    if (error) throw error
  },

  async deleteKPI(kpiId: string): Promise<void> {
    const { error } = await supabase
      .from('kpis')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', kpiId)

    if (error) throw error
  },
}
