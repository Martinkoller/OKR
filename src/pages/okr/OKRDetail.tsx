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
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { ActionPlanList } from '@/components/ActionPlanList'

export const OKRDetail = () => {
  const { id } = useParams()
  const { okrs, kpis } = useDataStore()

  const okr = okrs.find((o) => o.id === id)

  if (!okr) {
    return <div className="p-8 text-center">OKR não encontrado.</div>
  }

  const linkedKPIs = kpis.filter((k) => okr.kpiIds.includes(k.id))

  return (
    <div className="space-y-8 animate-fade-in">
      <Button
        variant="ghost"
        asChild
        className="pl-0 hover:pl-2 transition-all"
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
                  <CardDescription className="mb-2">
                    OKR Estratégico {okr.year}
                  </CardDescription>
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
                  <span className="text-sm font-medium">
                    Progresso Geral Calculado
                  </span>
                  <span className="text-2xl font-bold">{okr.progress}%</span>
                </div>
                <Progress value={okr.progress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  Calculado com base na média ponderada dos {linkedKPIs.length}{' '}
                  KPIs vinculados.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Plans Section */}
          <ActionPlanList entityId={okr.id} entityType="OKR" />

          <Card>
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
                          className="text-muted-foreground hover:text-primary"
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
                <span className="text-muted-foreground">Ciclo</span>
                <span className="font-medium">{okr.year}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
