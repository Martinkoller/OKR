import { supabase } from '@/lib/supabase/client'
import { User } from '@/types'

export const profileService = {
  async fetchProfiles(): Promise<Partial<User>[]> {
    const { data, error } = await supabase.from('profiles').select('*')

    if (error) throw error

    return data.map((p) => ({
      id: p.id,
      name: p.full_name || 'Usuário',
      // Map other fields if necessary or keep defaults
    }))
  },
}
