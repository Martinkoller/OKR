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
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { ClipboardList } from 'lucide-react'
import { KPI, ActionPlan } from '@/types'

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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4 shadow-sm">
        <CardHeader>
          <CardTitle>Evolução Estratégica</CardTitle>
          <CardDescription>
            Progresso médio dos OKRs nos últimos 6 meses
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[300px] w-full">
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
                <Bar dataKey="progress" fill="#003366" radius={[4, 4, 0, 0]} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-3 shadow-sm">
        <CardHeader>
          <CardTitle>KPIs em Alerta</CardTitle>
          <CardDescription>
            Indicadores com status Amarelo ou Vermelho
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criticalKpis.map((kpi) => (
              <div
                key={kpi.id}
                className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/kpis/${kpi.id}`}
                      className="text-sm font-medium line-clamp-1 hover:underline hover:text-blue-700"
                    >
                      {kpi.name}
                    </Link>
                    {kpi.weight >= 40 && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1 h-5"
                      >
                        Alta Prio.
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      Meta: {kpi.goal} {kpi.unit}
                    </p>
                    {hasActionPlan(kpi.id) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ClipboardList className="h-3 w-3 text-blue-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Possui Plano de Ação ativo</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge
                    status={kpi.status}
                    className="scale-90 origin-right"
                  />
                  <span className="text-xs font-mono">
                    {kpi.currentValue} {kpi.unit}
                  </span>
                </div>
              </div>
            ))}
            {criticalKpis.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Todos os KPIs estão performando bem!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
