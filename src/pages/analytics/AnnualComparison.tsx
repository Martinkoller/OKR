import { useState } from 'react'
import { useDataStore } from '@/stores/useDataStore'
import { useUserStore } from '@/stores/useUserStore'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  calculateOKRProgressForYear,
  getKPIValueForYear,
  downloadCSV,
} from '@/lib/kpi-utils'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  Download,
  FileSpreadsheet,
  Printer,
  CalendarDays,
  BarChart as BarChartIcon,
  Table as TableIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { usePermissions } from '@/hooks/usePermissions'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { BUFilter } from '@/components/dashboard/BUFilter'
import { formatNumber } from '@/lib/formatters'

export const AnnualComparison = () => {
  const { okrs, kpis, addAuditEntry } = useDataStore()
  const { selectedBUIds, currentUser, isGlobalView } = useUserStore()
  const { canExport } = usePermissions()

  const currentYear = new Date().getFullYear()
  const [yearA, setYearA] = useState<string>((currentYear - 1).toString())
  const [yearB, setYearB] = useState<string>(currentYear.toString())
  const [viewMode, setViewMode] = useState<'table' | 'analytics'>('table')

  const years = Array.from({ length: 5 }, (_, i) =>
    (currentYear - 2 + i).toString(),
  )

  const isGlobal = isGlobalView()

  const filteredOKRs = okrs.filter(
    (o) => isGlobal || selectedBUIds.includes(o.buId),
  )
  const filteredKPIs = kpis.filter(
    (k) => isGlobal || selectedBUIds.includes(k.buId),
  )

  const getDeltaColor = (valA: number, valB: number) => {
    if (valB > valA) return 'text-emerald-600'
    if (valB < valA) return 'text-red-600'
    return 'text-gray-600'
  }

  const getDeltaIcon = (valA: number, valB: number) => {
    if (valB > valA) return <ArrowUpRight className="h-4 w-4" />
    if (valB < valA) return <ArrowDownRight className="h-4 w-4" />
    return <ArrowRight className="h-4 w-4" />
  }

  const handleExportCSV = () => {
    if (!canExport('REPORT')) return

    const csvData: any[] = []

    // Add OKRs
    filteredOKRs.forEach((okr) => {
      const progA = calculateOKRProgressForYear(
        okr,
        kpis,
        parseInt(yearA),
      ).progress
      const progB = calculateOKRProgressForYear(
        okr,
        kpis,
        parseInt(yearB),
      ).progress
      const delta = progB - progA

      csvData.push({
        Type: 'OKR',
        Name: okr.title,
        BU: okr.buId,
        [`Value_${yearA}`]: `${progA}%`,
        [`Value_${yearB}`]: `${progB}%`,
        Variation_Abs: `${delta}%`,
        Status: okr.status,
      })
    })

    // Add KPI
    filteredKPIs.forEach((kpi) => {
      const valA = getKPIValueForYear(kpi, parseInt(yearA))
      const valB = getKPIValueForYear(kpi, parseInt(yearB))
      const percentDelta = valA !== 0 ? ((valB - valA) / valA) * 100 : 0

      csvData.push({
        Type: 'KPI',
        Name: kpi.name,
        BU: kpi.buId,
        [`Value_${yearA}`]: formatNumber(valA, kpi.unit),
        [`Value_${yearB}`]: formatNumber(valB, kpi.unit),
        Variation_Pct: `${percentDelta.toFixed(2)}%`,
        Status: kpi.status,
      })
    })

    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm')
    downloadCSV(
      csvData,
      `comparativo_anual_${yearA}_vs_${yearB}_${timestamp}.csv`,
    )

    if (currentUser) {
      addAuditEntry({
        entityType: 'REPORT',
        action: 'EXPORT',
        reason: `Exportação de Comparativo Anual ${yearA} vs ${yearB}`,
        userId: currentUser.id,
      })
    }
  }

  const handleExportPDF = () => {
    if (!canExport('REPORT')) return

    window.print()

    if (currentUser) {
      addAuditEntry({
        entityType: 'REPORT',
        action: 'EXPORT',
        reason: `Impressão de Comparativo Anual ${yearA} vs ${yearB}`,
        userId: currentUser.id,
      })
    }
  }

  // Analytics Data Preparation
  const okrChartData = filteredOKRs.map((okr) => ({
    name: okr.title.substring(0, 20) + '...',
    [yearA]: calculateOKRProgressForYear(okr, kpis, parseInt(yearA)).progress,
    [yearB]: calculateOKRProgressForYear(okr, kpis, parseInt(yearB)).progress,
  }))

  const kpiChartData = filteredKPIs.slice(0, 5).map((kpi) => ({
    name: kpi.name.substring(0, 20) + '...',
    [yearA]: getKPIValueForYear(kpi, parseInt(yearA)),
    [yearB]: getKPIValueForYear(kpi, parseInt(yearB)),
  }))

  return (
    <div className="space-y-8 animate-fade-in print:space-y-4 print:p-0">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Comparativo Anual de Desempenho
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise side-by-side de OKRs e KPIs entre períodos fiscais.
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground print:flex hidden">
            <CalendarDays className="h-4 w-4" />
            <span>
              Períodos: {yearA} vs {yearB}
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 no-print">
          <BUFilter />
          <div className="flex bg-muted rounded-md p-1">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <TableIcon className="h-4 w-4 mr-2" /> Tabela
            </Button>
            <Button
              variant={viewMode === 'analytics' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('analytics')}
            >
              <BarChartIcon className="h-4 w-4 mr-2" /> Analytics
            </Button>
          </div>

          {canExport('REPORT') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 ml-2">
                  <Download className="h-4 w-4" />
                  Exportar Relatório
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportPDF}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir / Salvar PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar Dados CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm ml-2">
            <Select value={yearA} onValueChange={setYearA}>
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={`a-${y}`} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground text-sm">vs</span>
            <Select value={yearB} onValueChange={setYearB}>
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={`b-${y}`} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <>
          <Card className="avoid-break shadow-none border print:border-gray-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#003366]" />
                <CardTitle>Evolução de OKRs</CardTitle>
              </div>
              <CardDescription>
                Comparação de progresso calculado nos finais de exercício.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Objetivo (OKR)</TableHead>
                    <TableHead>Ciclo</TableHead>
                    <TableHead className="text-center">{yearA}</TableHead>
                    <TableHead className="text-center">{yearB}</TableHead>
                    <TableHead className="text-right">Variação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOKRs.map((okr) => {
                    const progA = calculateOKRProgressForYear(
                      okr,
                      kpis,
                      parseInt(yearA),
                    ).progress
                    const progB = calculateOKRProgressForYear(
                      okr,
                      kpis,
                      parseInt(yearB),
                    ).progress
                    const delta = progB - progA

                    return (
                      <TableRow key={okr.id}>
                        <TableCell>
                          <div className="font-medium">{okr.title}</div>
                          {okr.scope === 'MULTI_YEAR' && (
                            <Badge
                              variant="secondary"
                              className="mt-1 text-[10px] px-1 h-5 print:border print:border-gray-200"
                            >
                              Plurianual
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {okr.startYear === okr.endYear
                            ? okr.startYear
                            : `${okr.startYear}-${okr.endYear}`}
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          {progA}%
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          {progB}%
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            className={cn(
                              'flex items-center justify-end gap-1 font-bold',
                              getDeltaColor(progA, progB),
                            )}
                          >
                            {getDeltaIcon(progA, progB)}
                            {delta > 0 ? '+' : ''}
                            {delta}%
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredOKRs.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-4 text-muted-foreground"
                      >
                        Nenhum dado para os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="page-break avoid-break shadow-none border print:border-gray-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#003366]" />
                <CardTitle>Performance de KPIs</CardTitle>
              </div>
              <CardDescription>
                Valores consolidados em 31 de Dezembro de cada ano selecionado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Indicador (KPI)</TableHead>
                    <TableHead>Meta Ref.</TableHead>
                    <TableHead className="text-right">{yearA}</TableHead>
                    <TableHead className="text-right">{yearB}</TableHead>
                    <TableHead className="text-right">Delta (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKPIs.map((kpi) => {
                    const valA = getKPIValueForYear(kpi, parseInt(yearA))
                    const valB = getKPIValueForYear(kpi, parseInt(yearB))
                    const percentDelta =
                      valA !== 0 ? ((valB - valA) / valA) * 100 : 0

                    return (
                      <TableRow key={kpi.id}>
                        <TableCell className="font-medium">
                          {kpi.name}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatNumber(kpi.goal, kpi.unit)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {formatNumber(valA, kpi.unit)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {formatNumber(valB, kpi.unit)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            className={cn(
                              'flex items-center justify-end gap-1 font-bold',
                              getDeltaColor(valA, valB),
                            )}
                          >
                            {getDeltaIcon(valA, valB)}
                            {percentDelta.toFixed(1)}%
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Comparativo de Progresso OKRs</CardTitle>
              <CardDescription>
                Comparação visual do percentual de conclusão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ChartContainer
                  config={{
                    [yearA]: { label: yearA, color: '#94a3b8' },
                    [yearB]: { label: yearB, color: '#003366' },
                  }}
                >
                  <BarChart
                    data={okrChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      dataKey={yearA}
                      fill="var(--color-yearA)"
                      radius={[4, 4, 0, 0]}
                      name={yearA}
                    />
                    <Bar
                      dataKey={yearB}
                      fill="var(--color-yearB)"
                      radius={[4, 4, 0, 0]}
                      name={yearB}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 5 KPIs - Evolução de Valor</CardTitle>
              <CardDescription>
                Variação absoluta dos principais indicadores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ChartContainer
                  config={{
                    [yearA]: { label: yearA, color: '#94a3b8' },
                    [yearB]: { label: yearB, color: '#10b981' },
                  }}
                >
                  <BarChart
                    data={kpiChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      dataKey={yearA}
                      fill="var(--color-yearA)"
                      radius={[4, 4, 0, 0]}
                      name={yearA}
                    />
                    <Bar
                      dataKey={yearB}
                      fill="var(--color-yearB)"
                      radius={[4, 4, 0, 0]}
                      name={yearB}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
