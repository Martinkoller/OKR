import { useParams, Link } from 'react-router-dom'
import { useDataStore } from '@/stores/useDataStore'
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
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  ExternalLink,
  CalendarRange,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { ActionPlanList } from '@/components/ActionPlanList'
import { calculateOKRProgressForDate, predictTrend } from '@/lib/kpi-utils'
import { format, subMonths, parseISO, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { KPIStatus } from '@/types'

export const OKRDetail = () => {
  const { id } = useParams()
  const { okrs, kpis } = useDataStore()

  const okr = okrs.find((o) => o.id === id)

  if (!okr) {
    return <div className="p-8 text-center">OKR não encontrado.</div>
  }

  const linkedKPIs = kpis.filter((k) => okr.kpiIds.includes(k.id))

  // Simulate/Calculate History for the last 6 months
  const today = new Date()
  const historyData: any[] = []

  for (let i = 5; i >= 0; i--) {
    const date = subMonths(today, i)
    // End of that month
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    // Only go up to current date (approx)
    if (endOfMonth > today) {
      // use today
    }

    const { progress } = calculateOKRProgressForDate(okr, kpis, endOfMonth)
    historyData.push({
      date: format(endOfMonth, 'dd/MM', { locale: ptBR }),
      fullDate: endOfMonth.toISOString(),
      value: progress,
      forecast: null,
    })
  }

  // Generate Forecast for OKR based on calculated history
  const historyForPrediction = historyData.map((h) => ({
    date: h.fullDate,
    value: h.value,
    timestamp: h.fullDate,
    updatedByUserId: 'system',
  }))

  const forecastPoints = predictTrend(historyForPrediction, 3)
  const forecastData = forecastPoints.map((p) => ({
    date: format(parseISO(p.date), 'dd/MM', { locale: ptBR }),
    value: null,
    forecast: p.value,
  }))

  // Merge for chart
  let combinedData = [...historyData]
  if (forecastData.length > 0) {
    // Link the lines
    const lastIndex = combinedData.length - 1
    combinedData[lastIndex].forecast = combinedData[lastIndex].value
    combinedData = [...combinedData, ...forecastData.slice(1)]
  }

  const nextEstimate = forecastData.length > 1 ? forecastData[1].forecast : null

  let estimatedStatus: KPIStatus | null = null
  if (nextEstimate !== null) {
    if (nextEstimate >= 100) estimatedStatus = 'GREEN'
    else if (nextEstimate >= 90) estimatedStatus = 'YELLOW'
    else estimatedStatus = 'RED'
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <Button
        variant="ghost"
        asChild
        className="pl-0 hover:pl-2 transition-all no-print"
      >
        <Link to="/okrs">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para OKRs
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {okr.scope === 'MULTI_YEAR' ? (
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-800 border-0"
                      >
                        <CalendarRange className="w-3 h-3 mr-1" />
                        Plurianual {okr.startYear}-{okr.endYear}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-gray-600 border-gray-200"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        Ciclo {okr.startYear}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl">{okr.title}</CardTitle>
                </div>
                <StatusBadge
                  status={okr.status}
                  className="text-base px-4 py-1"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-sm text-gray-900 mb-2">
                  Descrição
                </h3>
                <p className="text-gray-600">{okr.description}</p>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg border">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium">Progresso Geral</span>
                  <span className="text-2xl font-bold">{okr.progress}%</span>
                </div>
                <Progress value={okr.progress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  Calculado com base na média ponderada dos {linkedKPIs.length}{' '}
                  KPIs vinculados.
                </p>
              </div>

              {/* Forecast Chart */}
              <div className="pt-4">
                <h3 className="font-medium text-sm text-gray-900 mb-4">
                  Tendência e Previsão (6 Meses)
                </h3>
                <div className="h-[250px] w-full">
                  <ChartContainer
                    config={{
                      value: { label: 'Progresso Real', color: '#003366' },
                      forecast: { label: 'Estimativa', color: '#9333ea' },
                    }}
                  >
                    <ComposedChart
                      data={combinedData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}%`}
                        fontSize={12}
                        domain={[0, 100]}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--color-value)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="forecast"
                        stroke="var(--color-forecast)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </ComposedChart>
                  </ChartContainer>
                </div>

                {nextEstimate !== null && (
                  <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div className="text-sm text-purple-900">
                        <span className="font-semibold block mb-1">
                          Previsão de Progresso
                        </span>
                        Se a tendência se mantiver, esperamos atingir{' '}
                        <strong>
                          {Math.min(100, Math.round(nextEstimate))}%
                        </strong>{' '}
                        no próximo mês.
                      </div>
                    </div>

                    {estimatedStatus && (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-purple-700 uppercase font-bold tracking-wider mb-1">
                          Status Estimado
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'border-0 px-3 py-1 font-medium capitalize flex items-center gap-1',
                            estimatedStatus === 'GREEN'
                              ? 'bg-emerald-100 text-emerald-800'
                              : estimatedStatus === 'YELLOW'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800',
                          )}
                        >
                          {estimatedStatus === 'GREEN' && (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          {estimatedStatus === 'YELLOW' && (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          {estimatedStatus === 'RED' && (
                            <AlertTriangle className="w-3 h-3" />
                          )}

                          {estimatedStatus === 'GREEN' && 'No Prazo'}
                          {estimatedStatus === 'YELLOW' && 'Atenção'}
                          {estimatedStatus === 'RED' && 'Crítico'}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Plans Section */}
          <div className="no-print">
            <ActionPlanList entityId={okr.id} entityType="OKR" />
          </div>

          <Card className="page-break">
            <CardHeader>
              <CardTitle>KPIs Vinculados</CardTitle>
              <CardDescription>
                Indicadores que compõem este resultado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {linkedKPIs.map((kpi) => (
                  <div
                    key={kpi.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {kpi.name}
                        </span>
                        <Link
                          to={`/kpis/${kpi.id}`}
                          className="text-muted-foreground hover:text-primary no-print"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {kpi.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Peso no OKR: <strong>{kpi.weight}%</strong>
                        </span>
                        <span>
                          Meta:{' '}
                          <strong>
                            {kpi.goal} {kpi.unit}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:w-48 justify-end">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {kpi.currentValue} {kpi.unit}
                        </div>
                        <StatusBadge
                          status={kpi.status}
                          className="scale-75 origin-right"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadados</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Responsável</span>
                <span className="font-medium">User ID: {okr.ownerId}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Peso Estratégico</span>
                <span className="font-medium">{okr.weight}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Unidade</span>
                <span className="font-medium">{okr.buId}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Início</span>
                <span className="font-medium">{okr.startYear}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Fim</span>
                <span className="font-medium">{okr.endYear}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Escopo</span>
                <span className="font-medium">
                  {okr.scope === 'MULTI_YEAR' ? 'Plurianual' : 'Anual'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
