import { useState } from 'react'
import { useDataStore } from '@/stores/useDataStore'
import { useUserStore } from '@/stores/useUserStore'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ClipboardList,
  Plus,
  Edit2,
  Calendar,
  CheckCircle2,
  Link2,
  Eye,
} from 'lucide-react'
import { ActionPlanModal } from './ActionPlanModal'
import { ActionPlan } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ActionPlanListProps {
  entityId: string
  entityType: 'KPI' | 'OKR'
}

export const ActionPlanList = ({
  entityId,
  entityType,
}: ActionPlanListProps) => {
  const { actionPlans } = useDataStore()
  const { currentUser } = useUserStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<ActionPlan | undefined>(
    undefined,
  )

  const plans = actionPlans.filter((p) => {
    if (p.entityId === entityId) return true
    if (entityType === 'OKR' && p.linkedOkrIds?.includes(entityId)) return true
    if (entityType === 'KPI' && p.linkedKpiIds?.includes(entityId)) return true
    return false
  })

  const canEdit =
    currentUser?.role === 'GPM' ||
    currentUser?.role === 'PM' ||
    currentUser?.role === 'DIRECTOR_BU' ||
    currentUser?.role === 'DIRECTOR_GENERAL'

  const handleEdit = (plan: ActionPlan) => {
    setSelectedPlan(plan)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedPlan(undefined)
    setIsModalOpen(true)
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-blue-600" />
          Planos de Ação e Iniciativas
        </h3>
        {canEdit && (
          <Button size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" /> Novo Plano
          </Button>
        )}
      </div>

      {plans.length === 0 ? (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Nenhum plano de ação vinculado.
            {canEdit && ' Clique em "Novo Plano" para criar.'}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {plans.map((plan) => {
            const completedTasks = plan.tasks.filter(
              (t) => t.status === 'DONE',
            ).length
            const totalTasks = plan.tasks.length
            const progress =
              totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

            const isIndirectLink = plan.entityId !== entityId
            const isFinalized =
              plan.status === 'COMPLETED' || plan.status === 'CANCELLED'

            return (
              <Card key={plan.id} className="relative overflow-hidden group">
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    plan.status === 'COMPLETED' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-semibold">
                          {plan.title}
                        </CardTitle>
                        {isIndirectLink && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-muted/50 border-dashed gap-1 text-muted-foreground"
                          >
                            <Link2 className="h-3 w-3" /> Vinculado
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2 mt-1">
                        {plan.description}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(plan.status)}>
                      {plan.status === 'IN_PROGRESS' && 'Em Andamento'}
                      {plan.status === 'DRAFT' && 'Rascunho'}
                      {plan.status === 'COMPLETED' && 'Concluído'}
                      {plan.status === 'CANCELLED' && 'Cancelado'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Alvo: {format(new Date(plan.dueDate), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          {completedTasks}/{totalTasks} Tarefas
                        </span>
                      </div>
                    </div>
                    <Progress value={progress} className="h-2" />
                    {canEdit && (
                      <div className="flex justify-end pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(plan)}
                        >
                          {isFinalized ? (
                            <>
                              <Eye className="h-3 w-3 mr-2" /> Visualizar
                            </>
                          ) : (
                            <>
                              <Edit2 className="h-3 w-3 mr-2" /> Gerenciar
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <ActionPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entityId={entityId}
        entityType={entityType}
        existingPlan={selectedPlan}
      />
    </div>
  )
}
