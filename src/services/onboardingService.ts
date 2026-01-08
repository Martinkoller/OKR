const ONBOARDING_KEY_PREFIX = 'stratmanager_onboarding_completed_'

export const onboardingService = {
  async getStatus(userId: string): Promise<boolean> {
    try {
      const key = `${ONBOARDING_KEY_PREFIX}${userId}`
      const item = localStorage.getItem(key)
      return item === 'true'
    } catch (error) {
      console.error('Error reading onboarding status from localStorage:', error)
      return false
    }
  },

  async setCompleted(userId: string): Promise<void> {
    try {
      const key = `${ONBOARDING_KEY_PREFIX}${userId}`
      localStorage.setItem(key, 'true')
    } catch (error) {
      console.error('Error saving onboarding status to localStorage:', error)
    }
  },
}
