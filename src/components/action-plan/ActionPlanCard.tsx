import { ActionPlan } from '@/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, CheckCircle2, Edit2, Eye, Trash2, Link2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useUserStore } from '@/stores/useUserStore'
import { useDataStore } from '@/stores/useDataStore'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface ActionPlanCardProps {
  plan: ActionPlan
  onEdit: (plan: ActionPlan) => void
  onDelete: (plan: ActionPlan) => void
  canEdit: boolean
  canDelete: boolean
}

export const ActionPlanCard = ({
  plan,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: ActionPlanCardProps) => {
  const { users } = useUserStore()
  const { kpis, okrs } = useDataStore()

  const completedTasks = plan.tasks.filter((t) => t.status === 'DONE').length
  const totalTasks = plan.tasks.length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  const isFinalized = plan.status === 'COMPLETED' || plan.status === 'CANCELLED'

  const owner = users.find((u) => u.id === plan.ownerId)

  const getEntityName = () => {
    if (plan.entityType === 'KPI') {
      return kpis.find((k) => k.id === plan.entityId)?.name || 'KPI Removido'
    }
    return okrs.find((o) => o.id === plan.entityId)?.title || 'OKR Removido'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Rascunho'
      case 'IN_PROGRESS':
        return 'Em Andamento'
      case 'COMPLETED':
        return 'Concluído'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return status
    }
  }

  const statusBorderColor =
    plan.status === 'COMPLETED'
      ? '#10b981'
      : plan.status === 'IN_PROGRESS'
        ? '#3b82f6'
        : plan.status === 'CANCELLED'
          ? '#ef4444'
          : '#94a3b8'

  return (
    <Card
      className="flex flex-col h-full hover:shadow-md transition-all duration-200 border-l-4 group bg-white"
      style={{ borderLeftColor: statusBorderColor }}
    >
      <CardHeader className="pb-3 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] w-fit mb-1',
                getStatusColor(plan.status),
              )}
            >
              {getStatusLabel(plan.status)}
            </Badge>
            <CardTitle
              className="text-base font-semibold leading-tight line-clamp-2"
              title={plan.title}
            >
              {plan.title}
            </CardTitle>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant="secondary"
              className="text-[10px] whitespace-nowrap"
            >
              {plan.entityType}
            </Badge>
          </div>
        </div>
        <CardDescription className="line-clamp-2 text-xs h-8 leading-relaxed">
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary/70" />{' '}
                {completedTasks}/{totalTasks} tarefas
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          <div className="bg-muted/30 p-2 rounded-md border border-dashed flex items-center gap-2 text-xs text-muted-foreground">
            <Link2 className="h-3.5 w-3.5 shrink-0 opacity-70" />
            <span
              className="truncate font-medium"
              title={`Vinculado a: ${getEntityName()}`}
            >
              {getEntityName()}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t bg-muted/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <Avatar className="h-6 w-6 border shadow-sm">
                  <AvatarImage src={owner?.avatarUrl} />
                  <AvatarFallback className="text-[10px]">
                    {owner?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                  {owner?.name?.split(' ')[0]}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Responsável: {owner?.name || 'Desconhecido'}</p>
            </TooltipContent>
          </Tooltip>

          <div
            className="flex items-center gap-1 text-xs text-muted-foreground"
            title="Data Limite"
          >
            <Calendar className="h-3.5 w-3.5 opacity-70" />
            <span>
              {format(new Date(plan.dueDate), 'dd/MM/yy', { locale: ptBR })}
            </span>
          </div>
        </div>

        <div className="flex gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(plan)}
            title={isFinalized ? 'Visualizar' : 'Editar'}
          >
            {isFinalized ? (
              <Eye className="h-3.5 w-3.5 text-gray-500" />
            ) : (
              <Edit2 className="h-3.5 w-3.5 text-blue-600" />
            )}
          </Button>
          {canDelete && !isFinalized && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-red-50"
              onClick={() => onDelete(plan)}
              title="Excluir"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
