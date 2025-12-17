import { KPI, OKR, KPIStatus, KPIHistoryEntry } from '@/types'
import { isSameMonth, parseISO, addMonths, format } from 'date-fns'

export const calculateStatus = (value: number, goal: number): KPIStatus => {
  if (goal === 0) return 'GREEN'
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

  // If no history before date, return 0 (assuming didn't exist)
  return entry ? entry.value : 0
}

export const getKPIValueForYear = (kpi: KPI, year: number): number => {
  // Get value at end of year
  const endOfYear = new Date(year, 11, 31, 23, 59, 59)
  return getKPIValueForDate(kpi, endOfYear)
}

export const calculateOKRProgressForDate = (
  okr: OKR,
  kpis: KPI[],
  date: Date,
): { progress: number; status: KPIStatus } => {
  const linkedKPIs = kpis.filter((k) => okr.kpiIds.includes(k.id))
  if (linkedKPIs.length === 0) return { progress: 0, status: 'RED' }

  let totalWeight = 0
  let weightedProgress = 0

  linkedKPIs.forEach((kpi) => {
    const historicalValue = getKPIValueForDate(kpi, date)
    const kpiProgress = calculateKPIProgress(historicalValue, kpi.goal)

    totalWeight += kpi.weight
    weightedProgress += kpiProgress * kpi.weight
  })

  const finalProgress = totalWeight > 0 ? weightedProgress / totalWeight : 0

  let status: KPIStatus = 'RED'
  if (finalProgress >= 100) status = 'GREEN'
  else if (finalProgress >= 90) status = 'YELLOW'

  return { progress: Math.round(finalProgress), status }
}

export const calculateOKRProgressForYear = (
  okr: OKR,
  kpis: KPI[],
  year: number,
): { progress: number; status: KPIStatus } => {
  const endOfYear = new Date(year, 11, 31, 23, 59, 59)
  return calculateOKRProgressForDate(okr, kpis, endOfYear)
}

// Prediction Logic (Linear Regression)
export const predictTrend = (
  history: KPIHistoryEntry[],
  monthsToPredict: number = 3,
): { date: string; value: number; isForecast: boolean }[] => {
  if (history.length < 2) return []

  // Sort history ascending for calculation
  const sorted = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  // Prepare data points (X = timestamp, Y = value)
  const points = sorted.map((h) => ({
    x: new Date(h.date).getTime(),
    y: h.value,
  }))

  const n = points.length
  const sumX = points.reduce((acc, p) => acc + p.x, 0)
  const sumY = points.reduce((acc, p) => acc + p.y, 0)
  const sumXY = points.reduce((acc, p) => acc + p.x * p.y, 0)
  const sumXX = points.reduce((acc, p) => acc + p.x * p.x, 0)

  // Calculate slope (m) and intercept (b)
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Generate future points
  const lastDate = new Date(sorted[sorted.length - 1].date)
  const forecast: { date: string; value: number; isForecast: boolean }[] = []

  // Add the last actual point as the starting point of the forecast line
  forecast.push({
    date: sorted[sorted.length - 1].date,
    value: sorted[sorted.length - 1].value,
    isForecast: true,
  })

  for (let i = 1; i <= monthsToPredict; i++) {
    const futureDate = addMonths(lastDate, i)
    const futureX = futureDate.getTime()
    const predictedY = slope * futureX + intercept

    forecast.push({
      date: futureDate.toISOString(),
      value: Math.max(0, Math.round(predictedY)), // Prevent negative values
      isForecast: true,
    })
  }

  return forecast
}

// CSV Export Helper
export const downloadCSV = (data: any[], filename: string) => {
  if (!data.length) return

  // Extract headers
  const headers = Object.keys(data[0])

  // Format rows
  const csvContent = [
    headers.join(','), // Header row
    ...data.map((row) =>
      headers
        .map((fieldName) => {
          const value = row[fieldName]
          // Handle strings with commas
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value
        })
        .join(','),
    ),
  ].join('\n')

  // Create Blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
