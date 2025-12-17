import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useUserStore } from '@/stores/useUserStore'
import {
  NotificationRule,
  TriggerCondition,
  NotificationChannel,
} from '@/types'
import { useToast } from '@/hooks/use-toast'

interface NotificationRuleFormProps {
  isOpen: boolean
  onClose: () => void
  existingRule?: NotificationRule
}

export const NotificationRuleForm = ({
  isOpen,
  onClose,
  existingRule,
}: NotificationRuleFormProps) => {
  const { bus, currentUser, addRule, updateRule } = useUserStore()
  const { toast } = useToast()

  const [name, setName] = useState(existingRule?.name || '')
  const [buId, setBuId] = useState(existingRule?.buId || 'ALL')
  const [kpiType, setKpiType] = useState(existingRule?.kpiType || 'ALL')
  const [trigger, setTrigger] = useState<TriggerCondition>(
    existingRule?.triggerCondition || 'STATUS_CHANGE',
  )
  const [channels, setChannels] = useState<NotificationChannel[]>(
    existingRule?.channels || ['PORTAL'],
  )

  const isGeneralDirector = currentUser?.role === 'DIRECTOR_GENERAL'
  const userBUs = bus.filter((b) => currentUser?.buIds.includes(b.id))

  const handleSave = () => {
    if (!name) {
      toast({
        title: 'Nome obrigatório',
        description: 'Dê um nome para sua regra de notificação.',
        variant: 'destructive',
      })
      return
    }

    if (channels.length === 0) {
      toast({
        title: 'Canal obrigatório',
        description: 'Selecione pelo menos um canal de notificação.',
        variant: 'destructive',
      })
      return
    }

    const ruleData: NotificationRule = {
      id: existingRule?.id || `rule-${Date.now()}`,
      userId: currentUser?.id || 'unknown',
      name,
      buId,
      kpiType: kpiType as any,
      triggerCondition: trigger,
      channels,
      isActive: true,
    }

    if (existingRule) {
      updateRule(ruleData)
      toast({ title: 'Regra atualizada' })
    } else {
      addRule(ruleData)
      toast({ title: 'Regra criada' })
    }
    onClose()
  }

  const toggleChannel = (channel: NotificationChannel) => {
    if (channels.includes(channel)) {
      setChannels(channels.filter((c) => c !== channel))
    } else {
      setChannels([...channels, channel])
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingRule ? 'Editar Regra' : 'Nova Regra de Notificação'}
          </DialogTitle>
          <DialogDescription>
            Configure quando e como você deseja ser alertado.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome da Regra</Label>
            <Input
              id="name"
              placeholder="Ex: Alertas Críticos Varejo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Unidade de Negócio</Label>
              <Select value={buId} onValueChange={setBuId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {isGeneralDirector && (
                    <SelectItem value="ALL">Todas as BUs</SelectItem>
                  )}
                  {userBUs.map((bu) => (
                    <SelectItem key={bu.id} value={bu.id}>
                      {bu.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Tipo de KPI</Label>
              <Select value={kpiType} onValueChange={setKpiType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="QUANT">Quantitativo</SelectItem>
                  <SelectItem value="QUAL">Qualitativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Gatilho (Quando notificar?)</Label>
            <Select
              value={trigger}
              onValueChange={(val: TriggerCondition) => setTrigger(val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STATUS_CHANGE">
                  Qualquer mudança de status
                </SelectItem>
                <SelectItem value="STATUS_RED">
                  Apenas quando ficar Crítico (Vermelho)
                </SelectItem>
                <SelectItem value="RETROACTIVE_EDIT">
                  Edições Retroativas
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Canais de Comunicação</Label>
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="portal"
                  checked={channels.includes('PORTAL')}
                  onCheckedChange={() => toggleChannel('PORTAL')}
                />
                <Label htmlFor="portal" className="font-normal cursor-pointer">
                  Portal (Notificação interna)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={channels.includes('EMAIL')}
                  onCheckedChange={() => toggleChannel('EMAIL')}
                />
                <Label htmlFor="email" className="font-normal cursor-pointer">
                  E-mail
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Regra</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
