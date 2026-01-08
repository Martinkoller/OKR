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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getKPIValueForYear } from '@/lib/kpi-utils'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BUFilter } from '@/components/dashboard/BUFilter'
import { formatNumber } from '@/lib/formatters'

export const AnnualComparison = () => {
  const { kpis } = useDataStore()
  const { selectedBUIds, isGlobalView } = useUserStore()

  const currentYear = new Date().getFullYear()
  const [yearA, setYearA] = useState<string>((currentYear - 1).toString())
  const [yearB, setYearB] = useState<string>(currentYear.toString())

  const years = Array.from({ length: 5 }, (_, i) =>
    (currentYear - 2 + i).toString(),
  )

  const isGlobal = isGlobalView()

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

  return (
    <div className="space-y-8 animate-fade-in print:space-y-4 print:p-0">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Comparativo Anual
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise de evolução entre períodos fiscais.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 no-print">
          <BUFilter />

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

      <Card className="shadow-none border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#003366]" />
            <CardTitle>Performance de KPIs (Base Histórica)</CardTitle>
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
                // Uses the history from Supabase fetched via kpiService
                const valA = getKPIValueForYear(kpi, parseInt(yearA))
                const valB = getKPIValueForYear(kpi, parseInt(yearB))
                const percentDelta =
                  valA !== 0 ? ((valB - valA) / valA) * 100 : 0

                return (
                  <TableRow key={kpi.id}>
                    <TableCell className="font-medium">{kpi.name}</TableCell>
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
              {filteredKPIs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-muted-foreground"
                  >
                    Sem dados para exibir.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
