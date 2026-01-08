import { supabase } from '@/lib/supabase/client'

export const onboardingService = {
  async getStatus(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_onboarding')
      .select('completed')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching onboarding status:', error)
      return false
    }

    return data?.completed || false
  },

  async setCompleted(userId: string): Promise<void> {
    const { error } = await supabase.from('user_onboarding').upsert(
      {
        user_id: userId,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )

    if (error) throw error
  },
}
