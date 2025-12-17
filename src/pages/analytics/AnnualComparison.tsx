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

export const AnnualComparison = () => {
  const { okrs, kpis } = useDataStore()
  const { selectedBUId } = useUserStore()

  const currentYear = new Date().getFullYear()
  const [yearA, setYearA] = useState<string>((currentYear - 1).toString())
  const [yearB, setYearB] = useState<string>(currentYear.toString())

  const years = Array.from({ length: 5 }, (_, i) =>
    (currentYear - 2 + i).toString(),
  )

  const filteredOKRs = okrs.filter(
    (o) => selectedBUId === 'GLOBAL' || o.buId === selectedBUId,
  )
  const filteredKPIs = kpis.filter(
    (k) => selectedBUId === 'GLOBAL' || k.buId === selectedBUId,
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

    // Add KPIs
    filteredKPIs.forEach((kpi) => {
      const valA = getKPIValueForYear(kpi, parseInt(yearA))
      const valB = getKPIValueForYear(kpi, parseInt(yearB))
      const percentDelta = valA !== 0 ? ((valB - valA) / valA) * 100 : 0

      csvData.push({
        Type: 'KPI',
        Name: kpi.name,
        BU: kpi.buId,
        [`Value_${yearA}`]: valA,
        [`Value_${yearB}`]: valB,
        Variation_Pct: `${percentDelta.toFixed(2)}%`,
        Status: kpi.status,
      })
    })

    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm')
    downloadCSV(
      csvData,
      `comparativo_anual_${yearA}_vs_${yearB}_${timestamp}.csv`,
    )
  }

  const handleExportPDF = () => {
    window.print()
  }

  return (
    <div className="space-y-8 animate-fade-in print:space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Comparativo Anual de Desempenho
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise side-by-side de OKRs e KPIs entre períodos fiscais.
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPDF}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir / Salvar PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm ml-2">
            <Select value={yearA} onValueChange={setYearA}>
              <SelectTrigger className="w-[100px]">
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
              <SelectTrigger className="w-[100px]">
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

      <Card className="avoid-break">
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="page-break avoid-break">
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
                    <TableCell className="font-medium">{kpi.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {kpi.goal} {kpi.unit}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {valA.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {valB.toLocaleString()}
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
    </div>
  )
}
