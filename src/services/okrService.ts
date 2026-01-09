import { supabase } from '@/lib/supabase/client'
import { OKR } from '@/types'

export const okrService = {
  async fetchOKRs(): Promise<OKR[]> {
    const { data, error } = await supabase
      .from('okrs')
      .select('*, key_results(*)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching OKRs:', error)
      throw new Error(`Failed to fetch OKRs: ${error.message}`)
    }

    return data.map((o) => mapToOKR(o))
  },

  async fetchDeletedOKRs(): Promise<OKR[]> {
    const { data, error } = await supabase
      .from('okrs')
      .select('*, key_results(*)')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })

    if (error) {
      console.error('Error fetching deleted OKRs:', error)
      throw new Error(`Failed to fetch deleted OKRs: ${error.message}`)
    }

    return data.map((o) => mapToOKR(o))
  },

  async createOKR(okr: Partial<OKR>): Promise<OKR> {
    const { data, error } = await supabase
      .from('okrs')
      .insert({
        title: okr.title!,
        description: okr.description,
        bu_id: okr.buId!,
        owner_id: okr.ownerId,
        scope: okr.scope,
        start_date: okr.startDate,
        end_date: okr.endDate,
        weight: okr.weight,
        status: okr.status || 'DRAFT',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating OKR:', error)
      throw new Error(`Failed to create OKR: ${error.message}`)
    }

    // Insert Key Results if any
    if (okr.keyResults && okr.keyResults.length > 0) {
      const krs = okr.keyResults.map((kr) => ({
        okr_id: data.id,
        title: kr.title,
        target_value: kr.targetValue,
        current_value: kr.currentValue || 0,
        unit: kr.unit,
      }))
      const { error: krError } = await supabase.from('key_results').insert(krs)
      if (krError) {
        console.error('Failed to create key results', krError)
        // We don't throw here to avoid failing the whole OKR creation, but warn user
      }
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
      .eq('id', okr.id!)

    if (error) {
      console.error('Error updating OKR:', error)
      throw new Error(`Failed to update OKR: ${error.message}`)
    }

    // Note: Key Results update logic would go here if we were editing KRs in bulk.
  },

  async deleteOKR(id: string): Promise<void> {
    const { error } = await supabase
      .from('okrs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error deleting OKR:', error)
      throw new Error(`Failed to delete OKR: ${error.message}`)
    }
  },

  async restoreOKR(id: string): Promise<void> {
    const { error } = await supabase
      .from('okrs')
      .update({ deleted_at: null })
      .eq('id', id)

    if (error) {
      console.error('Error restoring OKR:', error)
      throw new Error(`Failed to restore OKR: ${error.message}`)
    }
  },
}

function mapToOKR(o: any): OKR {
  return {
    id: o.id,
    title: o.title,
    description: o.description || '',
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
    kpiIds: [], // Legacy support
    keyResults: o.key_results
      ? o.key_results.map((kr: any) => ({
          id: kr.id,
          okrId: kr.okr_id,
          title: kr.title,
          targetValue: Number(kr.target_value),
          currentValue: Number(kr.current_value),
          unit: kr.unit,
          createdAt: kr.created_at,
          updatedAt: kr.updated_at,
        }))
      : [],
    deletedAt: o.deleted_at,
  }
}
