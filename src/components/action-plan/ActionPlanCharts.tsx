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
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { ActionPlan, KPI } from '@/types'
import { useDataStore } from '@/stores/useDataStore'
import { calculateActionPlanStats } from '@/lib/dashboard-utils'

interface ActionPlanChartsProps {
  actionPlans: ActionPlan[]
}

const COLORS = {
  IN_PROGRESS: '#3b82f6', // blue-500
  COMPLETED: '#10b981', // emerald-500
  DELAYED: '#ef4444', // red-500 (Approximation for overdue logic)
  DRAFT: '#94a3b8', // slate-400
  CANCELLED: '#64748b', // slate-500
}

export const ActionPlanCharts = ({ actionPlans }: ActionPlanChartsProps) => {
  const { kpis } = useDataStore()

  // 1. Status Distribution
  const statusCounts = actionPlans.reduce(
    (acc, plan) => {
      acc[plan.status] = (acc[plan.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name:
      status === 'IN_PROGRESS'
        ? 'Em Andamento'
        : status === 'COMPLETED'
          ? 'Concluído'
          : status === 'DRAFT'
            ? 'Rascunho'
            : status === 'CANCELLED'
              ? 'Cancelado'
              : status,
    value: count,
    color: COLORS[status as keyof typeof COLORS] || '#000',
  }))

  // 2. Task Completion by Plan (Top 5 Active)
  const activePlans = actionPlans
    .filter((p) => p.status === 'IN_PROGRESS')
    .map((plan) => {
      const total = plan.tasks.length
      const completed = plan.tasks.filter((t) => t.status === 'DONE').length
      const progress = total > 0 ? (completed / total) * 100 : 0
      return {
        name:
          plan.title.length > 20
            ? plan.title.substring(0, 20) + '...'
            : plan.title,
        progress: Math.round(progress),
      }
    })
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5)

  // 3. Linked KPIs Summary
  // Get all KPIs linked to displayed action plans
  const linkedKpiIds = new Set<string>()
  actionPlans.forEach((plan) => {
    if (plan.entityType === 'KPI') linkedKpiIds.add(plan.entityId)
    if (plan.linkedKpiIds)
      plan.linkedKpiIds.forEach((id) => linkedKpiIds.add(id))
  })

  const linkedKpiStats = {
    GREEN: 0,
    YELLOW: 0,
    RED: 0,
  }

  linkedKpiIds.forEach((id) => {
    const kpi = kpis.find((k) => k.id === id)
    if (kpi) {
      linkedKpiStats[kpi.status]++
    }
  })

  const kpiBarData = [
    { status: 'No Prazo', count: linkedKpiStats.GREEN, fill: '#10b981' }, // Green
    { status: 'Atenção', count: linkedKpiStats.YELLOW, fill: '#f59e0b' }, // Yellow
    { status: 'Crítico', count: linkedKpiStats.RED, fill: '#ef4444' }, // Red
  ]

  return (
    <div className="grid gap-6 md:grid-cols-3 mb-8">
      {/* Status Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Distribuição de Status</CardTitle>
          <CardDescription>Visão geral dos planos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ChartContainer config={{}} className="h-full w-full">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Task Progress (Top Active) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Progresso de Tarefas</CardTitle>
          <CardDescription>Top 5 planos em andamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ChartContainer
              config={{
                progress: { label: 'Conclusão (%)', color: '#3b82f6' },
              }}
            >
              <BarChart
                data={activePlans}
                layout="vertical"
                margin={{ left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 10 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="progress"
                  fill="var(--color-progress)"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Linked KPI Impact */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Impacto nos KPIs</CardTitle>
          <CardDescription>Saúde dos indicadores vinculados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ChartContainer
              config={{ count: { label: 'KPIs', color: '#8884d8' } }}
            >
              <BarChart data={kpiBarData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {kpiBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
