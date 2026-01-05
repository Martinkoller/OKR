import { useState, useMemo } from 'react'
import { useDataStore } from '@/stores/useDataStore'
import { useUserStore } from '@/stores/useUserStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  ClipboardList,
  Calendar,
  LayoutDashboard,
} from 'lucide-react'
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
import { AnnualView } from '@/components/dashboard/AnnualView'
import { calculateAnnualTrend } from '@/lib/dashboard-utils'
import { cn } from '@/lib/utils'

export default function Index() {
  const { selectedBUIds, isGlobalView } = useUserStore()
  const { okrs, kpis, actionPlans } = useDataStore()

  const [viewMode, setViewMode] = useState<'current' | 'annual'>('current')
  const currentYear = new Date().getFullYear()

  const isGlobal = isGlobalView()

  const filteredOKRs = useMemo(
    () =>
      isGlobal ? okrs : okrs.filter((o) => selectedBUIds.includes(o.buId)),
    [okrs, isGlobal, selectedBUIds],
  )

  const filteredKPIs = useMemo(
    () =>
      isGlobal ? kpis : kpis.filter((k) => selectedBUIds.includes(k.buId)),
    [kpis, isGlobal, selectedBUIds],
  )

  const filteredActionPlans = useMemo(() => {
    if (isGlobal) return actionPlans
    // Filter action plans linked to filtered OKRs or KPIs
    const okrIds = filteredOKRs.map((o) => o.id)
    const kpiIds = filteredKPIs.map((k) => k.id)
    return actionPlans.filter(
      (p) =>
        (p.entityType === 'OKR' && okrIds.includes(p.entityId)) ||
        (p.entityType === 'KPI' && kpiIds.includes(p.entityId)),
    )
  }, [actionPlans, isGlobal, filteredOKRs, filteredKPIs])

  const totalOKRs = filteredOKRs.length
  const avgProgress =
    totalOKRs > 0
      ? filteredOKRs.reduce((acc, curr) => acc + curr.progress, 0) / totalOKRs
      : 0

  // Calculate dynamic trend data for the current year
  const trendData = useMemo(
    () => calculateAnnualTrend(filteredOKRs, filteredKPIs, currentYear),
    [filteredOKRs, filteredKPIs, currentYear],
  )

  // Slice trend data for "current view" to show recent context (e.g. last 6 months or YTD)
  const overviewTrendData = trendData // Can be sliced if needed

  const hasActionPlan = (entityId: string) => {
    return actionPlans.some(
      (p) =>
        p.entityId === entityId &&
        p.status !== 'COMPLETED' &&
        p.status !== 'CANCELLED',
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#003366]">
            StratManager{' '}
            <span className="text-muted-foreground font-light text-xl">
              by MarteckConsultoria
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão Estratégica Integrada -{' '}
            {isGlobal ? 'Visão Consolidada' : 'Unidades Selecionadas'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="bg-muted p-1 rounded-lg flex items-center">
            <Button
              variant={viewMode === 'current' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('current')}
              className="gap-2"
            >
              <LayoutDashboard className="h-4 w-4" /> Visão Atual
            </Button>
            <Button
              variant={viewMode === 'annual' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('annual')}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" /> Visão Anual
            </Button>
          </div>
          <div className="h-8 w-px bg-border hidden sm:block" />
          <BUFilter />
        </div>
      </div>

      <DashboardSummary
        okrs={filteredOKRs}
        kpis={filteredKPIs}
        avgProgress={avgProgress}
      />

      {viewMode === 'current' ? (
        <div className="space-y-8 animate-fade-in-up">
          <DashboardCharts
            trendData={overviewTrendData}
            kpis={filteredKPIs}
            actionPlans={filteredActionPlans}
          />

          <Card className="shadow-sm border-t-4 border-t-purple-600">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Acompanhamento de OKRs</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/okrs">
                  Ver Todos <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredOKRs.map((okr) => (
                  <div
                    key={okr.id}
                    className="group p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <Link
                            to={`/okrs/${okr.id}`}
                            className="font-semibold text-lg text-gray-900 hover:text-primary transition-colors flex items-center gap-2"
                          >
                            {okr.title}
                            {hasActionPlan(okr.id) && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className="ml-2 gap-1 border-blue-200 bg-blue-50 text-blue-700 font-normal px-2"
                                  >
                                    <ClipboardList className="h-3 w-3" /> Plano
                                    Ativo
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Existe um plano de ação vinculado.</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            {okr.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-xl font-bold block">
                            {okr.progress}%
                          </span>
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">
                            Concluído
                          </span>
                        </div>
                        <StatusBadge status={okr.status} />
                      </div>
                    </div>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between text-xs">
                        <span
                          className={cn(
                            'font-semibold px-2 py-0.5 rounded',
                            okr.status === 'GREEN'
                              ? 'bg-emerald-100 text-emerald-700'
                              : okr.status === 'YELLOW'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700',
                          )}
                        >
                          Status:{' '}
                          {okr.status === 'GREEN'
                            ? 'No Prazo'
                            : okr.status === 'YELLOW'
                              ? 'Atenção'
                              : 'Crítico'}
                        </span>
                        <span className="text-muted-foreground">
                          {okr.startYear}
                        </span>
                      </div>
                      <Progress value={okr.progress} className="h-3" />
                    </div>
                  </div>
                ))}
                {filteredOKRs.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                    Nenhum OKR encontrado para as unidades selecionadas.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <AnnualView
          okrs={filteredOKRs}
          kpis={filteredKPIs}
          year={currentYear}
        />
      )}
    </div>
  )
}
