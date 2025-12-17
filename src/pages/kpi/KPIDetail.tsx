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
import { ArrowLeft, History } from 'lucide-react'
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

  const handleUpdate = () => {
    const val = parseFloat(newValue)
    if (isNaN(val)) return

    // Calculate potential status
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
        description:
          'Para status de Atenção ou Crítico, é obrigatório informar uma justificativa.',
        variant: 'destructive',
      })
      return
    }

    if (!currentUser) return

    updateKPI(kpi.id, val, currentUser.id, justification)

    // Simulate Notification logic
    if (potentialStatus === 'RED') {
      addNotification(
        'Alerta de KPI',
        `O KPI ${kpi.name} entrou em estado crítico.`,
      )
      toast({
        title: 'E-mail enviado',
        description: 'Um alerta foi enviado para os gestores responsáveis.',
      })
    }

    toast({
      title: 'KPI Atualizado',
      description: 'O valor foi registrado com sucesso.',
    })

    setNewValue('')
    setJustification('')
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="pl-0">
          <Link to="/kpis">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para KPIs
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Section */}
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
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted/20 rounded-lg border">
                <div>
                  <span className="text-sm text-muted-foreground block">
                    Meta Estabelecida
                  </span>
                  <span className="text-2xl font-bold">
                    {kpi.goal}{' '}
                    <span className="text-sm font-normal text-muted-foreground">
                      {kpi.unit}
                    </span>
                  </span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block">
                    Valor Atual
                  </span>
                  <span className="text-2xl font-bold">
                    {kpi.currentValue}{' '}
                    <span className="text-sm font-normal text-muted-foreground">
                      {kpi.unit}
                    </span>
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Atualizar Medição</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="value">Novo Valor</Label>
                    <Input
                      id="value"
                      type="number"
                      placeholder="0.00"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="justification">
                      Justificativa / Comentário
                    </Label>
                    <Textarea
                      id="justification"
                      placeholder="Obrigatório se status for Amarelo ou Vermelho"
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

          <Card>
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

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhes Técnicos</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-xs">{kpi.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Unidade</span>
                <span className="font-medium uppercase">{kpi.unit}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Tipo</span>
                <span className="font-medium uppercase">{kpi.type}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Frequência</span>
                <span className="font-medium uppercase">{kpi.frequency}</span>
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
              para o valor <strong>{newValue}</strong>. Esta ação será
              registrada no log de auditoria permanentemente.
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
