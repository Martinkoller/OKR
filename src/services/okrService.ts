import { supabase } from '@/lib/supabase/client'
import { OKR, KeyResult } from '@/types'

export const okrService = {
  async fetchOKRs(): Promise<OKR[]> {
    const { data, error } = await supabase
      .from('okrs')
      .select('*, key_results(*)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map((o: any) => ({
      id: o.id,
      title: o.title,
      description: o.description,
      buId: o.bu_id,
      ownerId: o.owner_id,
      scope: o.scope,
      startDate: o.start_date,
      endDate: o.end_date,
      startYear: o.start_date
        ? new Date(o.start_date).getFullYear()
        : new Date().getFullYear(),
      endYear: o.end_date
        ? new Date(o.end_date).getFullYear()
        : new Date().getFullYear(),
      weight: Number(o.weight),
      status: o.status as any,
      progress: Number(o.progress),
      kpiIds: [], // Legacy compat
      keyResults: o.key_results.map((kr: any) => ({
        id: kr.id,
        okrId: kr.okr_id,
        title: kr.title,
        targetValue: Number(kr.target_value),
        currentValue: Number(kr.current_value),
        unit: kr.unit,
        createdAt: kr.created_at,
        updatedAt: kr.updated_at,
      })),
    }))
  },

  async createOKR(okr: Partial<OKR>): Promise<OKR> {
    const { data, error } = await supabase
      .from('okrs')
      .insert({
        title: okr.title,
        description: okr.description,
        bu_id: okr.buId,
        owner_id: okr.ownerId,
        scope: okr.scope,
        start_date: okr.startDate,
        end_date: okr.endDate,
        weight: okr.weight,
        status: okr.status || 'DRAFT',
      })
      .select()
      .single()

    if (error) throw error

    // Create KRs if any
    if (okr.keyResults && okr.keyResults.length > 0) {
      const krs = okr.keyResults.map((kr) => ({
        okr_id: data.id,
        title: kr.title,
        target_value: kr.targetValue,
        current_value: kr.currentValue,
        unit: kr.unit,
      }))
      const { error: krError } = await supabase.from('key_results').insert(krs)
      if (krError) console.error('Failed to create key results', krError)
    }

    return { ...okr, id: data.id } as OKR
  },

  async updateOKR(okr: Partial<OKR>): Promise<void> {
    const { error } = await supabase
      .from('okrs')
      .update({
        title: okr.title,
        description: okr.description,
        bu_id: okr.buId,
        owner_id: okr.ownerId,
        scope: okr.scope,
        start_date: okr.startDate,
        end_date: okr.endDate,
        weight: okr.weight,
        status: okr.status,
        progress: okr.progress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', okr.id)

    if (error) throw error
  },

  async deleteOKR(id: string): Promise<void> {
    const { error } = await supabase
      .from('okrs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },
}
