import { ActionPlan } from '@/types'
import { ActionPlanCard } from './ActionPlanCard'

interface ActionPlanGridProps {
  plans: ActionPlan[]
  onEdit: (plan: ActionPlan) => void
  onDelete: (plan: ActionPlan) => void
  canEdit: boolean
  canDelete: boolean
}

export const ActionPlanGrid = ({
  plans,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: ActionPlanGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up pb-4">
      {plans.map((plan) => (
        <ActionPlanCard
          key={plan.id}
          plan={plan}
          onEdit={onEdit}
          onDelete={onDelete}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      ))}
    </div>
  )
}
