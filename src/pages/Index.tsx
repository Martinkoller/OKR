import { useDataStore } from '@/stores/useDataStore'
import { useUserStore } from '@/stores/useUserStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Target,
  BarChart2,
  ClipboardList,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function Index() {
  const { selectedBUId } = useUserStore()
  const { okrs, kpis, actionPlans } = useDataStore()

  // Filter data based on BU
  const filteredOKRs =
    selectedBUId === 'GLOBAL'
      ? okrs
      : okrs.filter((o) => o.buId === selectedBUId)
  const filteredKPIs =
    selectedBUId === 'GLOBAL'
      ? kpis
      : kpis.filter((k) => k.buId === selectedBUId)

  // Stats
  const totalOKRs = filteredOKRs.length
  const avgProgress =
    totalOKRs > 0
      ? filteredOKRs.reduce((acc, curr) => acc + curr.progress, 0) / totalOKRs
      : 0
  const criticalKPIs = filteredKPIs.filter((k) => k.status === 'RED').length

  const kpiStatusData = [
    {
      name: 'No Prazo',
      value: filteredKPIs.filter((k) => k.status === 'GREEN').length,
      color: 'var(--color-green)',
    },
    {
      name: 'Atenção',
      value: filteredKPIs.filter((k) => k.status === 'YELLOW').length,
      color: 'var(--color-yellow)',
    },
    {
      name: 'Crítico',
      value: filteredKPIs.filter((k) => k.status === 'RED').length,
      color: 'var(--color-red)',
    },
  ]

  const chartConfig = {
    green: { label: 'No Prazo', color: '#10b981' },
    yellow: { label: 'Atenção', color: '#f59e0b' },
    red: { label: 'Crítico', color: '#ef4444' },
  }

  // Monthly Progress Mock Data for Chart
  const trendData = [
    { month: 'Jan', progress: 20 },
    { month: 'Fev', progress: 35 },
    { month: 'Mar', progress: 45 },
    { month: 'Abr', progress: 55 },
    { month: 'Mai', progress: 60 },
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard Estratégico
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral de desempenho -{' '}
            {selectedBUId === 'GLOBAL'
              ? 'Zucchetti Brasil'
              : 'Unidade Selecionada'}
          </p>
        </div>
        <Button asChild>
          <Link to="/okrs">
            Ver Todos OKRs <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de OKRs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOKRs}</div>
            <p className="text-xs text-muted-foreground">
              {filteredOKRs.filter((o) => o.status === 'GREEN').length} no prazo
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Progresso Geral
            </CardTitle>
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
            <div className="text-2xl font-bold text-red-600">
              {criticalKPIs}
            </div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção imediata
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saúde dos KPIs
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="h-[80px] flex items-center justify-center -mt-4">
            {/* Mini Pie Chart */}
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart */}
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
                  <Bar
                    dataKey="progress"
                    fill="#003366"
                    radius={[4, 4, 0, 0]}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Critical KPIs List */}
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>KPIs em Alerta</CardTitle>
            <CardDescription>
              Indicadores com status Amarelo ou Vermelho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredKPIs
                .filter((k) => k.status !== 'GREEN')
                .sort((a, b) => b.weight - a.weight) // Higher weight first
                .slice(0, 5)
                .map((kpi) => (
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
              {filteredKPIs.filter((k) => k.status !== 'GREEN').length ===
                0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Todos os KPIs estão performando bem!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OKR List Snapshot */}
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
                          <p>Existe um plano de ação vinculado a este OKR.</p>
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
