import { useState } from 'react'
import { useDataStore } from '@/stores/useDataStore'
import { useUserStore } from '@/stores/useUserStore'
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
  Search,
  Plus,
  Filter,
  LayoutGrid,
  List as ListIcon,
  LayoutDashboard,
} from 'lucide-react'
import { ActionPlanModal } from '@/components/ActionPlanModal'
import { ActionPlan } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { usePermissions } from '@/hooks/usePermissions'
import { BUFilter } from '@/components/dashboard/BUFilter'
import { ActionPlanCharts } from '@/components/action-plan/ActionPlanCharts'
import { ActionPlanGrid } from '@/components/action-plan/ActionPlanGrid'
import { ActionPlanTable } from '@/components/action-plan/ActionPlanTable'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const ActionPlansDashboard = () => {
  const { actionPlans, deleteActionPlan } = useDataStore()
  const { currentUser, selectedBUIds, isGlobalView } = useUserStore()
  const { toast } = useToast()
  const { checkPermission } = usePermissions()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<ActionPlan | undefined>(
    undefined,
  )

  const canEdit =
    checkPermission('KPI', 'EDIT') || checkPermission('OKR', 'EDIT')
  const canDelete = checkPermission('KPI', 'DELETE')

  const isGlobal = isGlobalView()

  const getPlanBUId = (plan: ActionPlan) => {
    // This helper would ideally need access to kpis/okrs from store,
    // but for filtering we rely on the derived data in store or pass it.
    // For simplicity, we assume actionPlans are filtered by their relation in the store logic
    // But actually, we need to filter here.
    const { kpis, okrs } = useDataStore.getState()
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

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#003366] flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Cockpit de Execução
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Gestão tática e acompanhamento de iniciativas estratégicas.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <BUFilter />
          {canEdit && (
            <Button onClick={handleCreate} className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> Novo Plano
            </Button>
          )}
        </div>
      </div>

      <ActionPlanCharts actionPlans={filteredPlans} />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur py-4 -my-4 px-1">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 w-full md:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar planos por título ou descrição..."
              className="pl-9 bg-background shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] shadow-sm">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </div>
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

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden md:inline-block mr-2">
            Modo de Visualização:
          </span>
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as 'list' | 'grid')}
            className="w-auto"
          >
            <TabsList className="grid w-[100px] grid-cols-2">
              <TabsTrigger value="grid" title="Visualização em Grade">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list" title="Visualização em Lista">
                <ListIcon className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="mt-4">
        {viewMode === 'grid' ? (
          <ActionPlanGrid
            plans={filteredPlans}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        ) : (
          <ActionPlanTable
            plans={filteredPlans}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        )}
      </div>

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
