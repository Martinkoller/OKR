import { useParams, Link } from 'react-router-dom'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  History,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { AuditLogTimeline } from '@/components/AuditLogTimeline'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ActionPlanList } from '@/components/ActionPlanList'
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ComposedChart,
  Line,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { predictTrend, calculateStatus } from '@/lib/kpi-utils'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { downloadICS } from '@/lib/calendar-utils'

export const KPIDetail = () => {
  const { id } = useParams()
  const { kpis, updateKPI, auditLogs } = useDataStore()
  const { currentUser, addNotification } = useUserStore()
  const { toast } = useToast()

  const kpi = kpis.find((k) => k.id === id)
  const kpiLogs = auditLogs.filter((l) => l.entityId === id)

  const [newValue, setNewValue] = useState<string>('')
  const [justification, setJustification] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (!kpi) {
    return <div className="p-8 text-center">KPI não encontrado.</div>
  }

  // Chart Data Preparation
  const rawHistory = [...kpi.history]
  // Sort oldest first
  rawHistory.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  const actualData = rawHistory.map((entry) => ({
    date: format(parseISO(entry.date), 'dd/MM', { locale: ptBR }),
    value: entry.value,
    forecast: null,
    isForecast: false,
  }))

  // If history is empty, show current
  if (actualData.length === 0) {
    actualData.push({
      date: format(new Date(), 'dd/MM'),
      value: kpi.currentValue,
      forecast: null,
      isForecast: false,
    })
  }

  // Generate Forecast
  const forecastPoints = predictTrend(kpi.history, 3)
  const forecastData = forecastPoints.map((p) => ({
    date: format(parseISO(p.date), 'dd/MM', { locale: ptBR }),
    value: null,
    forecast: p.value,
    isForecast: true,
  }))

  let combinedData: any[] = [...actualData]

  if (forecastData.length > 0) {
    // The first forecast point is the same date as last actual.
    // We update the last actual data point to include 'forecast' value equal to 'value'
    // so the forecast line connects there.
    const lastActualIndex = combinedData.length - 1
    combinedData[lastActualIndex].forecast = combinedData[lastActualIndex].value

    // Append the rest of forecast points (skipping the first one which was the anchor)
    combinedData = [...combinedData, ...forecastData.slice(1)]
  }

  const handleUpdate = () => {
    const val = parseFloat(newValue)
    if (isNaN(val)) return

    const potentialPercentage = val / kpi.goal
    let potentialStatus = 'GREEN'
    if (potentialPercentage < 0.9) potentialStatus = 'RED'
    else if (potentialPercentage < 1) potentialStatus = 'YELLOW'

    if (
      (potentialStatus === 'RED' || potentialStatus === 'YELLOW') &&
      !justification.trim()
    ) {
      toast({
        title: 'Justificativa Necessária',
        description: 'Obrigatório para status não-Verde.',
        variant: 'destructive',
      })
      return
    }

    if (!currentUser) return
    updateKPI(kpi.id, val, currentUser.id, justification)

    if (potentialStatus === 'RED') {
      addNotification(
        'Alerta de KPI',
        `O KPI ${kpi.name} entrou em estado crítico.`,
      )
    }

    toast({
      title: 'KPI Atualizado',
      description: 'Valor registrado com sucesso.',
    })
    setNewValue('')
    setJustification('')
    setIsDialogOpen(false)
  }

  const handleAddToCalendar = () => {
    // For KPI, we might use next update date or end of month
    // Let's assume end of current month
    const today = new Date()
    const deadline = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      17,
      0,
      0,
    )

    downloadICS(
      `Atualização KPI: ${kpi.name}`,
      `Lembrete de atualização mensal do indicador.\n\nMeta: ${kpi.goal} ${kpi.unit}`,
      deadline,
      window.location.href,
    )
    toast({
      title: 'Evento baixado',
      description: 'Adicione ao seu calendário.',
    })
  }

  // Get next estimated value
  const nextEstimate = forecastData.length > 1 ? forecastData[1].forecast : null
  const estimatedStatus =
    nextEstimate !== null ? calculateStatus(nextEstimate, kpi.goal) : null

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <Button variant="ghost" asChild className="pl-0 no-print">
          <Link to="/kpis">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para KPIs
          </Link>
        </Button>
        <Button
          variant="outline"
          onClick={handleAddToCalendar}
          className="no-print"
        >
          <CalendarDays className="mr-2 h-4 w-4" /> Adicionar ao Calendário
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardDescription className="uppercase text-xs font-bold tracking-wider mb-1">
                    {kpi.type} • {kpi.frequency}
                  </CardDescription>
                  <CardTitle className="text-2xl">{kpi.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {kpi.description}
                  </CardDescription>
                </div>
                <StatusBadge
                  status={kpi.status}
                  className="text-base px-4 py-1"
                  animate={kpi.status === 'RED'}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mb-6">
                <ChartContainer
                  config={{
                    value: { label: 'Histórico', color: '#2563eb' },
                    forecast: { label: 'Previsão', color: '#9333ea' },
                  }}
                >
                  <ComposedChart
                    data={combinedData}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <defs>
                      <linearGradient
                        id="fillValue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-value)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-value)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      domain={['auto', 'auto']}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-value)"
                      fill="url(#fillValue)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="var(--color-forecast)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4, fill: 'var(--color-forecast)' }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ChartContainer>
              </div>

              {nextEstimate !== null && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div className="text-sm text-purple-900">
                      <span className="font-semibold block mb-1">
                        Análise Preditiva
                      </span>
                      Estimamos que o valor atinja{' '}
                      <strong>{nextEstimate?.toLocaleString()}</strong> no
                      próximo ciclo.
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

              {/* Update Form */}
              <div className="space-y-4 pt-4 border-t no-print">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Atualizar Medição</h3>
                  <Link
                    to="/documentation"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="h-3 w-3" /> Regras de Cálculo
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="value">Novo Valor</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Insira o valor acumulado do período. O status será
                            recalculado automaticamente com base na meta de{' '}
                            {kpi.goal} {kpi.unit}.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="value"
                      type="number"
                      placeholder="0.00"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="justification">
                        Justificativa / Comentário
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Obrigatório para status Amarelo ou Vermelho. Ficará
                            registrado na trilha de auditoria.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Textarea
                      id="justification"
                      placeholder="Contexto sobre o novo valor..."
                      className="resize-none h-10 min-h-[40px] focus:h-24 transition-all"
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    disabled={!newValue}
                  >
                    Salvar Atualização
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="no-print">
            <ActionPlanList entityId={kpi.id} entityType="KPI" />
          </div>

          <Card className="page-break">
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Histórico de Auditoria</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <AuditLogTimeline logs={kpiLogs} className="h-[400px]" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhes Técnicos</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Meta</span>
                <span className="font-bold">
                  {kpi.goal} {kpi.unit}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Atual</span>
                <span className="font-bold">
                  {kpi.currentValue} {kpi.unit}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Unidade</span>
                <span className="font-medium uppercase">{kpi.unit}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Owner</span>
                <span className="font-medium">User {kpi.ownerId}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Atualização</DialogTitle>
            <DialogDescription>
              Você está prestes a atualizar o KPI <strong>{kpi.name}</strong>{' '}
              para o valor <strong>{newValue}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate}>Confirmar e Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
