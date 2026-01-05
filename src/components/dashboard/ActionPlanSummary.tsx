import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ActionPlan } from '@/types'
import { calculateActionPlanStats } from '@/lib/dashboard-utils'
import { CheckCircle2, Clock, AlertCircle, ClipboardList } from 'lucide-react'

interface ActionPlanSummaryProps {
  actionPlans: ActionPlan[]
}

export const ActionPlanSummary = ({ actionPlans }: ActionPlanSummaryProps) => {
  const stats = calculateActionPlanStats(actionPlans)

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList className="h-5 w-5 text-blue-600" />
          Execução de Planos
        </CardTitle>
        <CardDescription>Status das tarefas e ações corretivas</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">
                Conclusão de Tarefas
              </span>
              <span className="font-bold text-primary">
                {stats.progress.toFixed(0)}%
              </span>
            </div>
            <Progress value={stats.progress} className="h-2.5" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center justify-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mb-1" />
              <span className="text-xl font-bold text-emerald-700">
                {stats.completedTasks}
              </span>
              <span className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">
                Feito
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg border border-blue-100">
              <Clock className="h-5 w-5 text-blue-600 mb-1" />
              <span className="text-xl font-bold text-blue-700">
                {stats.pendingTasks}
              </span>
              <span className="text-[10px] text-blue-600 uppercase font-bold tracking-wider">
                Pendente
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-red-50 rounded-lg border border-red-100">
              <AlertCircle className="h-5 w-5 text-red-600 mb-1" />
              <span className="text-xl font-bold text-red-700">
                {stats.overdueTasks}
              </span>
              <span className="text-[10px] text-red-600 uppercase font-bold tracking-wider">
                Atrasado
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t text-xs text-muted-foreground flex justify-between font-medium">
          <span>Planos Totais: {stats.totalPlans}</span>
          <span>Em Andamento: {stats.activePlans}</span>
        </div>
      </CardContent>
    </Card>
  )
}
