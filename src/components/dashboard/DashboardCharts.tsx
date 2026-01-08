import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'
import { StatusBadge } from '@/components/StatusBadge'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip as UITooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import {
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { KPI, ActionPlan } from '@/types'
import { ActionPlanSummary } from '@/components/dashboard/ActionPlanSummary'
import { formatNumber } from '@/lib/formatters'

interface DashboardChartsProps {
  trendData: any[]
  kpis: KPI[]
  actionPlans: ActionPlan[]
}

export const DashboardCharts = ({
  trendData,
  kpis,
  actionPlans,
}: DashboardChartsProps) => {
  const hasActionPlan = (entityId: string) => {
    return actionPlans.some(
      (p) =>
        p.entityId === entityId &&
        p.status !== 'COMPLETED' &&
        p.status !== 'CANCELLED',
    )
  }

  const criticalKpis = kpis
    .filter((k) => k.status !== 'GREEN')
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Trend Chart */}
        <Card className="col-span-4 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Evolução Estratégica
            </CardTitle>
            <CardDescription>
              Progresso médio dos OKRs (Últimos meses)
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2 flex-1">
            <div className="h-[250px] w-full">
              <ChartContainer
                config={{ progress: { label: 'Progresso', color: '#003366' } }}
              >
                <BarChart data={trendData}>
                  <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Bar
                    dataKey="progress"
                    fill="#003366"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'transparent' }}
                    content={<ChartTooltipContent />}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Action Plan Summary Widget */}
        <div className="col-span-3">
          <ActionPlanSummary actionPlans={actionPlans} />
        </div>
      </div>

      {/* Critical KPIs Row */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                KPIs em Alerta
              </CardTitle>
              <CardDescription>
                Indicadores com status Amarelo ou Vermelho que requerem atenção
              </CardDescription>
            </div>
            <Badge variant="outline" className="ml-auto">
              {criticalKpis.length} Críticos
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {criticalKpis.map((kpi) => (
              <div
                key={kpi.id}
                className="flex flex-col gap-2 p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Link
                      to={`/kpis/${kpi.id}`}
                      className="font-semibold text-sm hover:underline hover:text-primary line-clamp-1"
                      title={kpi.name}
                    >
                      {kpi.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Meta: {formatNumber(kpi.goal, kpi.unit)}
                    </p>
                  </div>
                  <StatusBadge status={kpi.status} />
                </div>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-lg font-bold font-mono">
                    {formatNumber(kpi.currentValue, kpi.unit)}
                  </span>

                  <div className="flex items-center gap-2">
                    {kpi.weight >= 40 && (
                      <Badge variant="secondary" className="text-[10px] h-5">
                        Prioridade Alta
                      </Badge>
                    )}
                    {hasActionPlan(kpi.id) && (
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="outline"
                            className="h-5 w-5 p-0 flex items-center justify-center border-blue-200 bg-blue-50"
                          >
                            <ClipboardList className="h-3 w-3 text-blue-600" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Plano de Ação Ativo</p>
                        </TooltipContent>
                      </UITooltip>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {criticalKpis.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500 opacity-50" />
                Todos os KPIs estão performando bem!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
