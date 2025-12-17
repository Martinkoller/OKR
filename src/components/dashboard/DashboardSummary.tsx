import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { PieChart, Pie, Cell } from 'recharts'
import { Target, BarChart2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { OKR, KPI } from '@/types'

interface DashboardSummaryProps {
  okrs: OKR[]
  kpis: KPI[]
  avgProgress: number
}

const chartConfig = {
  green: { label: 'No Prazo', color: '#10b981' },
  yellow: { label: 'Atenção', color: '#f59e0b' },
  red: { label: 'Crítico', color: '#ef4444' },
}

export const DashboardSummary = ({
  okrs,
  kpis,
  avgProgress,
}: DashboardSummaryProps) => {
  const criticalKPIs = kpis.filter((k) => k.status === 'RED').length
  const kpiStatusData = [
    {
      name: 'No Prazo',
      value: kpis.filter((k) => k.status === 'GREEN').length,
      color: 'var(--color-green)',
    },
    {
      name: 'Atenção',
      value: kpis.filter((k) => k.status === 'YELLOW').length,
      color: 'var(--color-yellow)',
    },
    {
      name: 'Crítico',
      value: kpis.filter((k) => k.status === 'RED').length,
      color: 'var(--color-red)',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de OKRs</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{okrs.length}</div>
          <p className="text-xs text-muted-foreground">
            {okrs.filter((o) => o.status === 'GREEN').length} no prazo
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgProgress.toFixed(0)}%</div>
          <Progress value={avgProgress} className="h-2 mt-2" />
        </CardContent>
      </Card>
      <Card className="shadow-sm border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">KPIs Críticos</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{criticalKPIs}</div>
          <p className="text-xs text-muted-foreground">
            Requerem atenção imediata
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saúde dos KPIs</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent className="h-[80px] flex items-center justify-center -mt-4">
          <ChartContainer
            config={chartConfig}
            className="h-full w-full aspect-auto"
          >
            <PieChart>
              <Pie
                data={kpiStatusData}
                dataKey="value"
                nameKey="name"
                innerRadius={25}
                outerRadius={35}
                paddingAngle={2}
              >
                {kpiStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
