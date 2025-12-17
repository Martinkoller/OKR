import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  KPIStatus,
  KPI_STATUS_BG_COLORS,
  KPI_STATUS_TEXT_COLORS,
} from '@/types'

interface StatusBadgeProps {
  status: KPIStatus
  className?: string
  animate?: boolean
}

export const StatusBadge = ({
  status,
  className,
  animate,
}: StatusBadgeProps) => {
  const bg = KPI_STATUS_BG_COLORS[status]
  const text = KPI_STATUS_TEXT_COLORS[status]

  return (
    <Badge
      variant="outline"
      className={cn(
        'border-0 px-3 py-1 font-medium capitalize',
        bg,
        text,
        animate && 'animate-pulse',
        className,
      )}
    >
      {status === 'GREEN' && 'No Prazo'}
      {status === 'YELLOW' && 'Atenção'}
      {status === 'RED' && 'Crítico'}
    </Badge>
  )
}
