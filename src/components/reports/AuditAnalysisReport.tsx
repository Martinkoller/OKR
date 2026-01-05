import { useDataStore } from '@/stores/useDataStore'
import { useUserStore } from '@/stores/useUserStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import { format, subDays, startOfDay, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AuditEntity } from '@/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const CHART_COLORS = [
  '#003366',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
]

export const AuditAnalysisReport = () => {
  const { auditLogs } = useDataStore()
  const { users } = useUserStore()

  // 1. Changes over last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    return {
      date: date,
      label: format(date, 'dd/MM'),
      count: 0,
    }
  })

  auditLogs.forEach((log) => {
    const logDate = startOfDay(new Date(log.timestamp))
    const dayStat = last7Days.find((d) => isSameDay(d.date, logDate))
    if (dayStat) {
      dayStat.count++
    }
  })

  // 2. Changes by Entity Type
  const entityCounts: Record<string, number> = {}
  auditLogs.forEach((log) => {
    entityCounts[log.entityType] = (entityCounts[log.entityType] || 0) + 1
  })
  const entityData = Object.entries(entityCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // 3. Top Contributors
  const userCounts: Record<string, number> = {}
  auditLogs.forEach((log) => {
    userCounts[log.userId] = (userCounts[log.userId] || 0) + 1
  })
  const topUsers = Object.entries(userCounts)
    .map(([userId, count]) => {
      const user = users.find((u) => u.id === userId)
      return {
        userId,
        name: user?.name || userId,
        avatar: user?.avatarUrl,
        count,
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Frequência de Alterações (7 Dias)</CardTitle>
            <CardDescription>
              Volume diário de logs registrados no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  count: { label: 'Alterações', color: '#003366' },
                }}
              >
                <BarChart data={last7Days}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Entidade</CardTitle>
            <CardDescription>
              Tipos de registros mais modificados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={entityData.reduce(
                  (acc, item, idx) => ({
                    ...acc,
                    [item.name]: {
                      label: item.name,
                      color: CHART_COLORS[idx % CHART_COLORS.length],
                    },
                  }),
                  {},
                )}
              >
                <PieChart>
                  <Pie
                    data={entityData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {entityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Contribuidores</CardTitle>
          <CardDescription>
            Usuários com maior volume de atividades registradas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topUsers.map((user, index) => (
              <div
                key={user.userId}
                className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 font-bold text-muted-foreground">
                    #{index + 1}
                  </div>
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      ID: {user.userId}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-lg">{user.count}</span>
                  <span className="text-xs text-muted-foreground">ações</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
