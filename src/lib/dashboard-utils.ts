import { ActionPlan, KPI, OKR } from '@/types'
import { calculateOKRProgressForDate } from '@/lib/kpi-utils'
import { startOfYear, endOfYear, eachMonthOfInterval, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface ActionPlanStats {
  totalPlans: number
  activePlans: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
  progress: number
}

export const calculateActionPlanStats = (
  actionPlans: ActionPlan[],
): ActionPlanStats => {
  let totalTasks = 0
  let completedTasks = 0
  let pendingTasks = 0
  let overdueTasks = 0

  const now = new Date()

  actionPlans.forEach((plan) => {
    if (plan.status === 'CANCELLED') return

    plan.tasks.forEach((task) => {
      totalTasks++
      if (task.status === 'DONE') {
        completedTasks++
      } else {
        pendingTasks++
        if (task.deadline && new Date(task.deadline) < now) {
          overdueTasks++
        }
      }
    })
  })

  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return {
    totalPlans: actionPlans.length,
    activePlans: actionPlans.filter((p) => p.status === 'IN_PROGRESS').length,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    progress,
  }
}

export const calculateAnnualTrend = (
  okrs: OKR[],
  kpis: KPI[],
  year: number,
) => {
  const start = startOfYear(new Date(year, 0, 1))
  const end =
    new Date() < endOfYear(new Date(year, 0, 1)) &&
    year === new Date().getFullYear()
      ? new Date()
      : endOfYear(new Date(year, 0, 1))

  const months = eachMonthOfInterval({ start, end })

  return months.map((date) => {
    // For each month, calculate the average OKR progress at the end of that month
    const endOfMonthDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    // Average OKR Progress
    const okrProgresses = okrs.map(
      (okr) => calculateOKRProgressForDate(okr, kpis, endOfMonthDate).progress,
    )
    const avgOkrProgress =
      okrProgresses.length > 0
        ? okrProgresses.reduce((a, b) => a + b, 0) / okrProgresses.length
        : 0

    return {
      month: format(date, 'MMM', { locale: ptBR }),
      fullDate: date.toISOString(),
      progress: Math.round(avgOkrProgress),
    }
  })
}
