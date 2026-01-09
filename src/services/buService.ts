import { supabase } from '@/lib/supabase/client'
import { BU } from '@/types'

export const buService = {
  async fetchBUs(): Promise<BU[]> {
    const { data, error } = await supabase
      .from('business_units')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching BUs:', error)
      throw new Error(`Falha ao buscar Unidades de Negócio: ${error.message}`)
    }

    return data.map((bu) => ({
      id: bu.id,
      name: bu.name,
      description: bu.description || '',
      slug: bu.slug || '',
      parentId: bu.parent_id,
      roleIds: [], // Roles are not yet implemented in DB
    }))
  },

  async createBU(bu: Partial<BU>): Promise<BU> {
    const parentId = bu.parentId === 'none' || !bu.parentId ? null : bu.parentId

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

    if (error) {
      console.error('Error creating BU:', error)
      throw new Error(`Erro ao criar Unidade de Negócio: ${error.message}`)
    }

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
    if (!bu.id) throw new Error('ID da BU é obrigatório para atualização')

    const parentId = bu.parentId === 'none' || !bu.parentId ? null : bu.parentId

    const { error } = await supabase
      .from('business_units')
      .update({
        name: bu.name,
        description: bu.description,
        slug: bu.slug,
        parent_id: parentId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bu.id)

    if (error) {
      console.error('Error updating BU:', error)
      throw new Error(`Erro ao atualizar Unidade de Negócio: ${error.message}`)
    }
  },

  async deleteBU(id: string): Promise<void> {
    const { error } = await supabase
      .from('business_units')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting BU:', error)
      throw new Error(`Erro ao excluir Unidade de Negócio: ${error.message}`)
    }
  },
}
