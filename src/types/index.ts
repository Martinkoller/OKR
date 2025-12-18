export type Role = string

export type BU = {
  id: string
  name: string
  slug: string
  parentId?: string | null // For hierarchy
  roleIds?: string[] // Roles inherited by members of this BU
}

export type Group = {
  id: string
  name: string
  description: string
  roleIds: string[] // Roles inherited by members of this Group
  createdAt: string
  updatedAt: string
}

export type User = {
  id: string
  name: string
  email: string
  password?: string // Mock password for validation
  role: Role // Direct role
  buIds: string[] // User can belong to multiple BUs
  groupIds?: string[] // User can belong to multiple Access Groups
  avatarUrl?: string
  active: boolean
}

export type PermissionModule = 'OKR' | 'KPI' | 'REPORT' | 'SETTINGS'
export type PermissionAction = 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE' | 'EXPORT'

export type RoleDefinition = {
  id: string
  name: string
  description: string
  permissions: Record<PermissionModule, PermissionAction[]>
  isSystem: boolean
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

export type OKRScope = 'ANNUAL' | 'MULTI_YEAR'

export type OKR = {
  id: string
  title: string
  description?: string
  buId: string
  scope: OKRScope
  startYear: number
  endYear: number
  weight: number // Strategic Weight 1-5 or 1-100
  ownerId: string
  kpiIds: string[]
  progress: number // 0-100
  status: KPIStatus
}

export type ActionPlanStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
export type TaskStatus = 'PENDING' | 'DONE' | 'OVERDUE'

export type ActionPlanTask = {
  id: string
  description: string
  ownerId: string
  deadline: string // ISO Date
  status: TaskStatus
}

export type ActionPlan = {
  id: string
  title: string
  description: string
  entityId: string // KPI ID or OKR ID
  entityType: 'KPI' | 'OKR'
  status: ActionPlanStatus
  dueDate: string // ISO Date
  ownerId: string
  tasks: ActionPlanTask[]
  createdAt: string
  updatedAt: string
}

export type AuditEntity =
  | 'KPI'
  | 'OKR'
  | 'ACTION_PLAN'
  | 'ROLE'
  | 'USER'
  | 'REPORT'
  | 'GROUP'
  | 'BU'
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT'

export type AuditEntry = {
  id: string
  entityId?: string
  entityType: AuditEntity
  action: AuditAction
  field?: string
  oldValue?: string | number
  newValue?: string | number
  reason?: string
  userId: string
  timestamp: string
  details?: string
}

export type TriggerCondition =
  | 'STATUS_CHANGE'
  | 'STATUS_RED'
  | 'RETROACTIVE_EDIT'
export type NotificationChannel = 'PORTAL' | 'EMAIL'

export type NotificationRule = {
  id: string
  userId: string
  name: string
  buId: string | 'ALL'
  kpiType: 'ALL' | 'QUANT' | 'QUAL'
  triggerCondition: TriggerCondition
  channels: NotificationChannel[]
  isActive: boolean
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
