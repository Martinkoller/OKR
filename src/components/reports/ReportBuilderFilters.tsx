import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BU, OKR, KPI } from '@/types'
import { BUFilter } from '@/components/dashboard/BUFilter'

interface ReportBuilderFiltersProps {
  bus: BU[]
  okrs: OKR[]
  kpis: KPI[]
  selectedOKRIds: string[]
  setSelectedOKRIds: (ids: string[]) => void
  selectedKPIIds: string[]
  setSelectedKPIIds: (ids: string[]) => void
}

export const ReportBuilderFilters = ({
  okrs,
  kpis,
  selectedOKRIds,
  setSelectedOKRIds,
  selectedKPIIds,
  setSelectedKPIIds,
}: ReportBuilderFiltersProps) => {
  const toggleOKR = (id: string) => {
    if (selectedOKRIds.includes(id)) {
      setSelectedOKRIds(selectedOKRIds.filter((i) => i !== id))
    } else {
      setSelectedOKRIds([...selectedOKRIds, id])
    }
  }

  const toggleKPI = (id: string) => {
    if (selectedKPIIds.includes(id)) {
      setSelectedKPIIds(selectedKPIIds.filter((i) => i !== id))
    } else {
      setSelectedKPIIds([...selectedKPIIds, id])
    }
  }

  const toggleAllOKRs = () => {
    if (selectedOKRIds.length === okrs.length) {
      setSelectedOKRIds([])
    } else {
      setSelectedOKRIds(okrs.map((o) => o.id))
    }
  }

  const toggleAllKPIs = () => {
    if (selectedKPIIds.length === kpis.length) {
      setSelectedKPIIds([])
    } else {
      setSelectedKPIIds(kpis.map((k) => k.id))
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Filtros de Contexto</CardTitle>
          <CardDescription>
            Selecione a Unidade de Negócio para filtrar os dados disponíveis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Label>Unidade de Negócio</Label>
            <BUFilter />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Seleção de Métricas</CardTitle>
          <CardDescription>
            Escolha quais OKRs e KPIs aparecerão no relatório.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>OKRs ({okrs.length})</Label>
              <span
                className="text-xs text-blue-600 cursor-pointer hover:underline"
                onClick={toggleAllOKRs}
              >
                {selectedOKRIds.length === okrs.length
                  ? 'Desmarcar Todos'
                  : 'Selecionar Todos'}
              </span>
            </div>
            <ScrollArea className="h-[200px] border rounded-md p-2">
              <div className="space-y-2">
                {okrs.map((okr) => (
                  <div key={okr.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={`okr-${okr.id}`}
                      checked={selectedOKRIds.includes(okr.id)}
                      onCheckedChange={() => toggleOKR(okr.id)}
                    />
                    <label
                      htmlFor={`okr-${okr.id}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <span className="font-medium">{okr.title}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {okr.progress}% concluído
                      </p>
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>KPIs ({kpis.length})</Label>
              <span
                className="text-xs text-blue-600 cursor-pointer hover:underline"
                onClick={toggleAllKPIs}
              >
                {selectedKPIIds.length === kpis.length
                  ? 'Desmarcar Todos'
                  : 'Selecionar Todos'}
              </span>
            </div>
            <ScrollArea className="h-[200px] border rounded-md p-2">
              <div className="space-y-2">
                {kpis.map((kpi) => (
                  <div key={kpi.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={`kpi-${kpi.id}`}
                      checked={selectedKPIIds.includes(kpi.id)}
                      onCheckedChange={() => toggleKPI(kpi.id)}
                    />
                    <label
                      htmlFor={`kpi-${kpi.id}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <span className="font-medium">{kpi.name}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {kpi.currentValue} {kpi.unit}
                      </p>
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
