import { useState } from 'react'
import { useDataStore } from '@/stores/useDataStore'
import { useUserStore } from '@/stores/useUserStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Plus,
  Filter,
  Calendar,
  ClipboardList,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react'
import { ActionPlanModal } from '@/components/ActionPlanModal'
import { ActionPlan } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import { usePermissions } from '@/hooks/usePermissions'
import { BUFilter } from '@/components/dashboard/BUFilter'

export const ActionPlansDashboard = () => {
  const { actionPlans, deleteActionPlan, kpis, okrs } = useDataStore()
  const { users, currentUser, selectedBUIds, isGlobalView } = useUserStore()
  const { toast } = useToast()
  const { checkPermission } = usePermissions()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<ActionPlan | undefined>(
    undefined,
  )

  const canEdit =
    checkPermission('KPI', 'EDIT') || checkPermission('OKR', 'EDIT')
  const canDelete = checkPermission('KPI', 'DELETE')

  const isGlobal = isGlobalView()

  const getEntityName = (plan: ActionPlan) => {
    if (plan.entityType === 'KPI') {
      return kpis.find((k) => k.id === plan.entityId)?.name || 'KPI Removido'
    }
    return okrs.find((o) => o.id === plan.entityId)?.title || 'OKR Removido'
  }

  const getPlanBUId = (plan: ActionPlan) => {
    if (plan.entityType === 'KPI') {
      return kpis.find((k) => k.id === plan.entityId)?.buId
    }
    return okrs.find((o) => o.id === plan.entityId)?.buId
  }

  const filteredPlans = actionPlans.filter((plan) => {
    const planBuId = getPlanBUId(plan)
    if (!isGlobal && planBuId && !selectedBUIds.includes(planBuId)) return false

    const searchMatch =
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase())
    if (!searchMatch) return false

    if (statusFilter !== 'ALL' && plan.status !== statusFilter) return false

    return true
  })

  const handleCreate = () => {
    setSelectedPlan(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (plan: ActionPlan) => {
    setSelectedPlan(plan)
    setIsModalOpen(true)
  }

  const handleDelete = (plan: ActionPlan) => {
    if (!currentUser) return
    if (confirm(`Tem certeza que deseja excluir o plano "${plan.title}"?`)) {
      deleteActionPlan(plan.id, currentUser.id)
      toast({ title: 'Plano excluído com sucesso.' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestão de Planos de Ação
          </h1>
          <p className="text-muted-foreground">
            Centralize a execução de iniciativas estratégicas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BUFilter />
          {canEdit && (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" /> Novo Plano
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar planos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os Status</SelectItem>
              <SelectItem value="DRAFT">Rascunho</SelectItem>
              <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
              <SelectItem value="COMPLETED">Concluído</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Todos os Planos</CardTitle>
          <CardDescription>
            Listagem completa de ações corretivas e projetos vinculados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Título</TableHead>
                  <TableHead>Vínculo</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Tarefas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum plano de ação encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlans.map((plan) => {
                    const completedTasks = plan.tasks.filter(
                      (t) => t.status === 'DONE',
                    ).length
                    const totalTasks = plan.tasks.length
                    const isFinalized =
                      plan.status === 'COMPLETED' || plan.status === 'CANCELLED'

                    return (
                      <TableRow key={plan.id}>
                        <TableCell>
                          <div className="font-medium">{plan.title}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {plan.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {plan.entityType}
                          </Badge>
                          <div
                            className="text-xs text-muted-foreground truncate max-w-[150px] mt-1"
                            title={getEntityName(plan)}
                          >
                            {getEntityName(plan)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {users.find((u) => u.id === plan.ownerId)?.name ||
                                'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {format(new Date(plan.dueDate), 'dd/MM/yy', {
                              locale: ptBR,
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs">
                            <ClipboardList className="h-3 w-3 text-muted-foreground" />
                            <span>
                              {completedTasks}/{totalTasks}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(plan.status)}>
                            {plan.status === 'IN_PROGRESS' && 'Em Andamento'}
                            {plan.status === 'DRAFT' && 'Rascunho'}
                            {plan.status === 'COMPLETED' && 'Concluído'}
                            {plan.status === 'CANCELLED' && 'Cancelado'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(plan)}
                              title={isFinalized ? 'Visualizar' : 'Editar'}
                            >
                              {isFinalized ? (
                                <Eye className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Edit2 className="h-4 w-4" />
                              )}
                            </Button>
                            {canDelete && !isFinalized && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(plan)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ActionPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entityId={selectedPlan ? selectedPlan.entityId : ''}
        entityType={selectedPlan ? selectedPlan.entityType : 'KPI'}
        existingPlan={selectedPlan}
        allowEntitySelection={!selectedPlan}
      />
    </div>
  )
}
