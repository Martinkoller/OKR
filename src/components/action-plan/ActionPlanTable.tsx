import { ActionPlan } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  ClipboardList,
  Edit2,
  Eye,
  Trash2,
  MoreHorizontal,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useUserStore } from '@/stores/useUserStore'
import { useDataStore } from '@/stores/useDataStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ActionPlanTableProps {
  plans: ActionPlan[]
  onEdit: (plan: ActionPlan) => void
  onDelete: (plan: ActionPlan) => void
  canEdit: boolean
  canDelete: boolean
}

export const ActionPlanTable = ({
  plans,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: ActionPlanTableProps) => {
  const { users } = useUserStore()
  const { kpis, okrs } = useDataStore()

  const getOwnerName = (ownerId: string) => {
    return users.find((u) => u.id === ownerId)?.name || ownerId
  }

  const getEntityName = (plan: ActionPlan) => {
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

  return (
    <div className="rounded-md border bg-white shadow-sm overflow-hidden animate-fade-in">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="w-[30%]">Título / Estratégia</TableHead>
            <TableHead>Vínculo Principal</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead>Tarefas</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-12 text-muted-foreground"
              >
                Nenhum plano de ação encontrado.
              </TableCell>
            </TableRow>
          ) : (
            plans.map((plan) => {
              const completedTasks = plan.tasks.filter(
                (t) => t.status === 'DONE',
              ).length
              const totalTasks = plan.tasks.length
              const isFinalized =
                plan.status === 'COMPLETED' || plan.status === 'CANCELLED'

              return (
                <TableRow key={plan.id} className="group hover:bg-muted/30">
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-gray-900 line-clamp-1">
                        {plan.title}
                      </span>
                      <span className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                        {plan.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant="outline"
                        className="w-fit text-[10px] px-1.5"
                      >
                        {plan.entityType}
                      </Badge>
                      <span
                        className="text-xs text-muted-foreground truncate max-w-[180px]"
                        title={getEntityName(plan)}
                      >
                        {getEntityName(plan)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-gray-700">
                      {getOwnerName(plan.ownerId)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="mr-1.5 h-3.5 w-3.5" />
                      {format(new Date(plan.dueDate), 'dd/MM/yy', {
                        locale: ptBR,
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>
                        {completedTasks}/{totalTasks}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getStatusColor(plan.status)}
                      variant="outline"
                    >
                      {plan.status === 'IN_PROGRESS' && 'Em Andamento'}
                      {plan.status === 'DRAFT' && 'Rascunho'}
                      {plan.status === 'COMPLETED' && 'Concluído'}
                      {plan.status === 'CANCELLED' && 'Cancelado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(plan)}>
                          {isFinalized ? (
                            <>
                              <Eye className="h-4 w-4 mr-2" /> Visualizar
                            </>
                          ) : (
                            <>
                              <Edit2 className="h-4 w-4 mr-2" /> Gerenciar
                            </>
                          )}
                        </DropdownMenuItem>
                        {canDelete && !isFinalized && (
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => onDelete(plan)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
