import { useDataStore } from '@/stores/useDataStore'
import { useUserStore } from '@/stores/useUserStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ArrowRight, ClipboardList } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DashboardSummary } from '@/components/dashboard/DashboardSummary'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { BUFilter } from '@/components/dashboard/BUFilter'

export default function Index() {
  const { selectedBUIds, isGlobalView } = useUserStore()
  const { okrs, kpis, actionPlans } = useDataStore()

  const isGlobal = isGlobalView()

  const filteredOKRs = isGlobal
    ? okrs
    : okrs.filter((o) => selectedBUIds.includes(o.buId))
  const filteredKPIs = isGlobal
    ? kpis
    : kpis.filter((k) => selectedBUIds.includes(k.buId))

  const totalOKRs = filteredOKRs.length
  const avgProgress =
    totalOKRs > 0
      ? filteredOKRs.reduce((acc, curr) => acc + curr.progress, 0) / totalOKRs
      : 0

  const trendData = [
    { month: 'Jan', progress: 45 },
    { month: 'Fev', progress: 50 },
    { month: 'Mar', progress: 55 },
    { month: 'Abr', progress: 62 },
    { month: 'Mai', progress: 68 },
    { month: 'Jun', progress: avgProgress },
  ]

  const hasActionPlan = (entityId: string) => {
    return actionPlans.some(
      (p) =>
        p.entityId === entityId &&
        p.status !== 'COMPLETED' &&
        p.status !== 'CANCELLED',
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard Estratégico
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral de desempenho -{' '}
            {isGlobal
              ? 'Zucchetti Brasil (Consolidado)'
              : 'Unidades Selecionadas'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BUFilter />
          <Button asChild>
            <Link to="/okrs">
              Ver Todos OKRs <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <DashboardSummary
        okrs={filteredOKRs}
        kpis={filteredKPIs}
        avgProgress={avgProgress}
      />
      <DashboardCharts
        trendData={trendData}
        kpis={filteredKPIs}
        actionPlans={actionPlans}
      />

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Objetivos Estratégicos (OKRs)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredOKRs.map((okr) => (
              <div key={okr.id} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div>
                      <Link
                        to={`/okrs/${okr.id}`}
                        className="font-semibold text-gray-900 hover:underline hover:text-[#003366] transition-colors"
                      >
                        {okr.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {okr.description}
                      </p>
                    </div>
                    {hasActionPlan(okr.id) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="outline"
                            className="ml-2 gap-1 border-blue-200 bg-blue-50 text-blue-700"
                          >
                            <ClipboardList className="h-3 w-3" /> Plano Ativo
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Existe um plano de ação vinculado.</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-bold block">
                        {okr.progress}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Concluído
                      </span>
                    </div>
                    <StatusBadge status={okr.status} />
                  </div>
                </div>
                <Progress value={okr.progress} className="h-2" />
              </div>
            ))}
            {filteredOKRs.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                Nenhum OKR encontrado para as unidades selecionadas.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
