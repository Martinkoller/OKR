export type Role = 'DIRECTOR_GENERAL' | 'DIRECTOR_BU' | 'GPM' | 'PM' | 'VIEWER'

export type BU = {
  id: string
  name: string
  slug: string
}

export type User = {
  id: string
  name: string
  email: string
  role: Role
  buIds: string[] // User can belong to multiple BUs
  avatarUrl?: string
}

export type KPIFrequency = 'MONTHLY' | 'BIMONTHLY' | 'QUARTERLY' | 'SEMESTERLY'
export type KPIType = 'QUANT' | 'QUAL'
export type KPIStatus = 'GREEN' | 'YELLOW' | 'RED'
export type KPITrend = 'UP' | 'DOWN' | 'STABLE'

export type KPIHistoryEntry = {
  date: string // ISO Date
  value: number
  comment?: string
  updatedByUserId: string
  timestamp: string
}

export type KPI = {
  id: string
  name: string
  description?: string
  buId: string
  ownerId: string
  frequency: KPIFrequency
  type: KPIType
  unit: string
  goal: number
  weight: number // 0-100 relative to OKR
  currentValue: number
  status: KPIStatus
  lastUpdated: string
  history: KPIHistoryEntry[]
}

export type OKR = {
  id: string
  title: string
  description?: string
  buId: string
  year: number
  weight: number // Strategic Weight 1-5 or 1-100
  ownerId: string
  kpiIds: string[]
  progress: number // 0-100
  status: KPIStatus
}

export type AuditEntry = {
  id: string
  entityId: string
  entityType: 'KPI' | 'OKR'
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  field?: string
  oldValue?: string | number
  newValue?: string | number
  reason?: string
  userId: string
  timestamp: string
}

export const KPI_STATUS_COLORS = {
  GREEN: 'bg-emerald-500',
  YELLOW: 'bg-amber-500',
  RED: 'bg-red-500',
}

export const KPI_STATUS_TEXT_COLORS = {
  GREEN: 'text-emerald-700',
  YELLOW: 'text-amber-700',
  RED: 'text-red-700',
}

export const KPI_STATUS_BG_COLORS = {
  GREEN: 'bg-emerald-100',
  YELLOW: 'bg-amber-100',
  RED: 'bg-red-100',
}
