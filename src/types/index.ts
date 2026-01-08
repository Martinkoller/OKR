export type Role = string

export type BU = {
  id: string
  name: string
  description?: string
  slug: string
  parentId?: string | null
  roleIds?: string[]
}

export type Group = {
  id: string
  name: string
  description: string
  roleIds: string[]
  createdAt: string
  updatedAt: string
}

export type PermissionModule =
  | 'OKR'
  | 'KPI'
  | 'REPORT'
  | 'SETTINGS'
  | 'ACTION_PLAN'
export type PermissionAction = 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE' | 'EXPORT'

export type User = {
  id: string
  name: string
  email: string
  password?: string
  role: Role
  buIds: string[]
  groupIds?: string[]
  avatarUrl?: string
  active: boolean
  extraPermissions?: Partial<Record<PermissionModule, PermissionAction[]>>
}

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
  date: string
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
  weight: number
  currentValue: number
  status: KPIStatus
  lastUpdated: string
  history: KPIHistoryEntry[]
  deletedAt?: string
}

export type OKRScope = 'ANNUAL' | 'MULTI_YEAR'

export type KeyResult = {
  id: string
  okrId: string
  title: string
  targetValue: number
  currentValue: number
  unit: string
  createdAt: string
  updatedAt: string
}

export type OKR = {
  id: string
  title: string
  description?: string
  buId: string
  scope: OKRScope
  startDate?: string
  endDate?: string
  startYear: number // Derived or legacy for UI compatibility
  endYear: number // Derived or legacy for UI compatibility
  weight: number
  ownerId: string
  kpiIds: string[] // Kept for backward compat / hybrid model
  keyResults?: KeyResult[] // New native key results
  progress: number
  status: KPIStatus
  deletedAt?: string
}

export type ActionPlanStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
export type TaskStatus = 'PENDING' | 'DONE' | 'OVERDUE'

export type Attachment = {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: string
}

export type ActionPlanTask = {
  id: string
  description: string
  ownerId: string
  deadline: string
  status: TaskStatus
  attachments?: Attachment[]
}

export type ActionPlan = {
  id: string
  title: string
  description: string
  entityId: string
  entityType: 'KPI' | 'OKR'
  status: ActionPlanStatus
  dueDate: string
  ownerId: string
  tasks: ActionPlanTask[]
  createdAt: string
  updatedAt: string
  linkedKpiIds?: string[]
  linkedOkrIds?: string[]
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
  | 'SYSTEM'
  | 'PAGE'
  | 'TEMPLATE'
  | 'INTEGRATION'
export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'EXPORT'
  | 'ACCESS'
  | 'RESTORE'

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
  | 'THRESHOLD'
export type NotificationChannel = 'PORTAL' | 'EMAIL'
export type NotificationTargetType = 'KPI' | 'OKR' | 'ALL'
export type AlertOperator = 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS'

export type NotificationRule = {
  id: string
  userId: string
  name: string
  buId: string | 'ALL'
  targetType?: NotificationTargetType
  kpiType: 'ALL' | 'QUANT' | 'QUAL'
  triggerCondition: TriggerCondition
  threshold?: number
  operator?: AlertOperator
  targetEntityId?: string
  channels: NotificationChannel[]
  isActive: boolean
}

export type TemplateType = 'OKR' | 'KPI'

export interface Template {
  id: string
  type: TemplateType
  title: string
  description: string
  formula?: string
  frequency?: KPIFrequency
  kpiType?: KPIType
  unit?: string
  suggestedGoal?: number
  scope?: OKRScope
  suggestedMetrics?: string[]
}

export type AlertType = 'PERFORMANCE' | 'SECURITY' | 'TASK'
export type SecuritySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Alert {
  id: string
  type: AlertType
  title: string
  message: string
  timestamp: string
  read: boolean
  severity?: SecuritySeverity
  link?: string
}

export interface DashboardConfig {
  pinnedOKRIds: string[]
  pinnedKPIIds: string[]
}

export interface BIConfig {
  provider: 'POWER_BI'
  enabled: boolean
  workspaceId?: string
  reportId?: string
  embedUrl?: string
  updatedAt: string
  updatedBy: string
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
