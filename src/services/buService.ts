import { supabase } from '@/lib/supabase/client'
import { BU } from '@/types'

export const buService = {
  async fetchBUs(): Promise<BU[]> {
    const { data, error } = await supabase
      .from('business_units')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    return data.map((bu) => ({
      id: bu.id,
      name: bu.name,
      description: bu.description || '',
      slug: bu.slug || '',
      parentId: bu.parent_id,
      roleIds: [], // Not yet implemented in DB
    }))
  },

  async createBU(bu: Partial<BU>): Promise<BU> {
    // Ensure parentId is null if not provided or empty
    const parentId = bu.parentId || null

    const { data, error } = await supabase
      .from('business_units')
      .insert({
        name: bu.name!,
        description: bu.description,
        slug: bu.slug,
        parent_id: parentId,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      slug: data.slug || '',
      parentId: data.parent_id,
      roleIds: [],
    }
  },

  async updateBU(bu: Partial<BU>): Promise<void> {
    const parentId = bu.parentId || null

    const { error } = await supabase
      .from('business_units')
      .update({
        name: bu.name,
        description: bu.description,
        slug: bu.slug,
        parent_id: parentId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bu.id!)

    if (error) throw error
  },

  async deleteBU(id: string): Promise<void> {
    const { error } = await supabase
      .from('business_units')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}
