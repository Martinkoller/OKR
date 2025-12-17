import { KPI, OKR, KPIStatus } from '@/types'
import { isSameMonth, parseISO } from 'date-fns'

export const calculateStatus = (value: number, goal: number): KPIStatus => {
  if (goal === 0) return 'GREEN'
  // For things like Churn (lower is better), we would need a direction flag.
  // For simplicity assuming higher is better or goal is a target to reach.
  // Ideally we would check KPI 'trend' or 'type', but keeping logic simple as per initial code.

  // If goal is small (like 5% churn), logic might be inverted in real world.
  // Adhering to original store logic: % of goal.
  const percentage = value / goal
  if (percentage >= 1) return 'GREEN'
  if (percentage >= 0.9) return 'YELLOW'
  return 'RED'
}

export const calculateKPIProgress = (value: number, goal: number): number => {
  if (goal === 0) return 0
  return Math.min((value / goal) * 100, 100)
}

export const calculateOKRProgress = (
  okr: OKR,
  kpis: KPI[],
): { progress: number; status: KPIStatus } => {
  const linkedKPIs = kpis.filter((k) => okr.kpiIds.includes(k.id))
  if (linkedKPIs.length === 0) return { progress: 0, status: 'RED' }

  let totalWeight = 0
  let weightedProgress = 0

  linkedKPIs.forEach((kpi) => {
    totalWeight += kpi.weight
    const kpiProgress = calculateKPIProgress(kpi.currentValue, kpi.goal)
    weightedProgress += kpiProgress * kpi.weight
  })

  const finalProgress = totalWeight > 0 ? weightedProgress / totalWeight : 0

  let status: KPIStatus = 'RED'
  if (finalProgress >= 100) status = 'GREEN'
  else if (finalProgress >= 90) status = 'YELLOW'

  return { progress: Math.round(finalProgress), status }
}

export const getKPIValueForDate = (kpi: KPI, date: Date): number => {
  // Sort history descending
  const sortedHistory = [...kpi.history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  // Find entry in same month or the closest previous one
  const entry = sortedHistory.find((h) => new Date(h.date) <= date)

  return entry ? entry.value : kpi.currentValue // Fallback to current if no history
}
