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
  Unlink,
  Plus,
  Edit,
  CalendarDays,
  History,
  GitCompare,
} from 'lucide-react'
import { ActionPlanList } from '@/components/ActionPlanList'
import { calculateOKRProgressForDate, predictTrend } from '@/lib/kpi-utils'
import { format, subMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
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
import { useToast } from '@/hooks/use-toast'
import { KPIFormDialog } from '@/components/kpi/KPIFormDialog'
import { useState } from 'react'
import { OKRFormDialog } from '@/components/okr/OKRFormDialog'
import { usePermissions } from '@/hooks/usePermissions'
import { downloadICS } from '@/lib/calendar-utils'
import { AuditLogTimeline } from '@/components/AuditLogTimeline'
import { VersionComparison } from '@/components/history/VersionComparison'

export const OKRDetail = () => {
  const { id } = useParams()
  const { okrs, kpis, updateOKR, auditLogs } = useDataStore()
  const { users, bus, currentUser } = useUserStore()
  const { toast } = useToast()
  const { canEdit } = usePermissions()

  const [isKPIFormOpen, setIsKPIFormOpen] = useState(false)
  const [isEditOKROpen, setIsEditOKROpen] = useState(false)
  const [isVersionCompareOpen, setIsVersionCompareOpen] = useState(false)

  const okr = okrs.find((o) => o.id === id)
  const okrLogs = auditLogs.filter((l) => l.entityId === id)

  if (!okr) {
    return <div className="p-8 text-center">OKR não encontrado.</div>
  }

  if (okr.deletedAt) {
    return (
      <div className="p-8 flex flex-col items-center justify-center space-y-4">
        <div className="p-4 rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-xl font-bold">OKR Excluído</h1>
        <p className="text-muted-foreground">Este objetivo está na lixeira.</p>
        <Button asChild variant="outline">
          <Link to="/admin">Ir para Lixeira</Link>
        </Button>
      </div>
    )
  }

  const linkedKPIs = kpis.filter((k) => okr.kpiIds.includes(k.id))

  // Helper names
  const getOwnerName = (userId: string) =>
    users.find((u) => u.id === userId)?.name || userId
  const getBUName = (buId: string) =>
    bus.find((b) => b.id === buId)?.name || buId

  const handleUnlinkKPI = (kpiId: string) => {
    if (!currentUser) return
    if (confirm('Tem certeza que deseja desvincular este KPI do OKR?')) {
      const newKpiIds = okr.kpiIds.filter((id) => id !== kpiId)
      const updatedOKR = { ...okr, kpiIds: newKpiIds }
      updateOKR(updatedOKR, currentUser.id)
      toast({
        title: 'KPI Desvinculado',
        description: 'O indicador foi removido deste OKR.',
      })
    }
  }

  const handleKPICreated = (kpi: any) => {
    if (!currentUser) return
    const newKpiIds = [...okr.kpiIds, kpi.id]
    const updatedOKR = { ...okr, kpiIds: newKpiIds }
    updateOKR(updatedOKR, currentUser.id)
    setIsKPIFormOpen(false)
  }

  const handleAddToCalendar = () => {
    // Assuming end of year as deadline for OKR
    const deadline = new Date(okr.endYear, 11, 31, 17, 0, 0)
    downloadICS(
      `Prazo OKR: ${okr.title}`,
      `Entrega final do Objetivo Estratégico.\n\nDescrição: ${okr.description}`,
      deadline,
      window.location.href,
    )
    toast({
      title: 'Evento baixado',
      description: 'Adicione ao seu calendário.',
    })
  }

  // Simulate/Calculate History for the last 6 months
  const today = new Date()
  const historyData: any[] = []

  for (let i = 5; i >= 0; i--) {
    const date = subMonths(today, i)
    // End of that month
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

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

  const canManage = canEdit('OKR')

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          asChild
          className="pl-0 hover:pl-2 transition-all no-print"
        >
          <Link to="/okrs">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para OKRs
          </Link>
        </Button>
        <div className="flex gap-2 no-print">
          <Button variant="outline" onClick={handleAddToCalendar}>
            <CalendarDays className="mr-2 h-4 w-4" /> Adicionar ao Calendário
          </Button>
          {canManage && (
            <Button
              variant="outline"
              onClick={() => setIsEditOKROpen(true)}
              className="no-print"
            >
              <Edit className="mr-2 h-4 w-4" /> Editar OKR
            </Button>
          )}
        </div>
      </div>

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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>KPIs Vinculados</CardTitle>
                <CardDescription>
                  Indicadores que compõem este resultado
                </CardDescription>
              </div>
              {canManage && (
                <Button size="sm" onClick={() => setIsKPIFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Novo KPI
                </Button>
              )}
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
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          Responsável:{' '}
                          <strong>{getOwnerName(kpi.ownerId)}</strong>
                        </span>
                        <span>
                          Unidade: <strong>{getBUName(kpi.buId)}</strong>
                        </span>
                        <span>
                          Peso: <strong>{kpi.weight}%</strong>
                        </span>
                        <span>
                          Meta:{' '}
                          <strong>
                            {kpi.goal} {kpi.unit}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:w-auto justify-end">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {kpi.currentValue} {kpi.unit}
                        </div>
                        <StatusBadge
                          status={kpi.status}
                          className="scale-75 origin-right"
                        />
                      </div>
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 no-print"
                          onClick={() => handleUnlinkKPI(kpi.id)}
                          title="Desvincular KPI"
                        >
                          <Unlink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {linkedKPIs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-md">
                    Nenhum KPI vinculado a este objetivo.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Change History */}
          <Card className="page-break">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Histórico de Auditoria</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsVersionCompareOpen(true)}
                >
                  <GitCompare className="mr-2 h-4 w-4" /> Comparar Versões
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AuditLogTimeline logs={okrLogs} className="h-[400px]" />
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
                <span className="font-medium">{getOwnerName(okr.ownerId)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Peso Estratégico</span>
                <span className="font-medium">{okr.weight}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Unidade</span>
                <span className="font-medium">{getBUName(okr.buId)}</span>
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

      <KPIFormDialog
        open={isKPIFormOpen}
        onOpenChange={setIsKPIFormOpen}
        onSuccess={handleKPICreated}
        defaultValues={{ buId: okr.buId }}
      />

      <OKRFormDialog
        open={isEditOKROpen}
        onOpenChange={setIsEditOKROpen}
        okrToEdit={okr}
      />

      <VersionComparison
        entityId={okr.id}
        entityType="OKR"
        isOpen={isVersionCompareOpen}
        onClose={() => setIsVersionCompareOpen(false)}
      />
    </div>
  )
}
