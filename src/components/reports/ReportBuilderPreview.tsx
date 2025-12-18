import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/StatusBadge'
import { OKR, KPI } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ReportBuilderPreviewProps {
  okrs: OKR[]
  kpis: KPI[]
  selectedBUName: string
}

export const ReportBuilderPreview = ({
  okrs,
  kpis,
  selectedBUName,
}: ReportBuilderPreviewProps) => {
  return (
    <Card className="print:border-0 print:shadow-none h-full">
      <CardHeader className="print:pb-0">
        <div className="flex justify-between items-start">
          <div>
            <CardDescription className="uppercase tracking-wider text-xs">
              Relatório de Desempenho
            </CardDescription>
            <CardTitle className="text-2xl mt-1">{selectedBUName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Gerado em:{' '}
              {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <div className="text-right hidden print:block">
            <span className="text-lg font-bold text-[#003366]">Zucchetti</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 print:pt-4">
        {okrs.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg border-b pb-2">
              Objetivos Estratégicos (OKRs)
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Título</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {okrs.map((okr) => (
                  <TableRow key={okr.id}>
                    <TableCell>
                      <div className="font-medium">{okr.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {okr.description}
                      </div>
                    </TableCell>
                    <TableCell>{okr.weight}</TableCell>
                    <TableCell className="font-bold">{okr.progress}%</TableCell>
                    <TableCell>
                      <StatusBadge status={okr.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {kpis.length > 0 && (
          <div className="space-y-3 break-before-auto">
            <h3 className="font-semibold text-lg border-b pb-2">
              Indicadores de Performance (KPIs)
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Nome</TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Atual</TableHead>
                  <TableHead>Freq.</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kpis.map((kpi) => (
                  <TableRow key={kpi.id}>
                    <TableCell>
                      <div className="font-medium">{kpi.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {kpi.unit}
                      </div>
                    </TableCell>
                    <TableCell>
                      {kpi.goal} {kpi.unit}
                    </TableCell>
                    <TableCell className="font-bold">
                      {kpi.currentValue} {kpi.unit}
                    </TableCell>
                    <TableCell className="text-xs uppercase">
                      {kpi.frequency}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={kpi.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {okrs.length === 0 && kpis.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
            <p className="text-muted-foreground">
              Selecione métricas no painel ao lado para visualizar o relatório.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
