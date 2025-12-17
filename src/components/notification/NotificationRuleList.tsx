import { useUserStore } from '@/stores/useUserStore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Plus, BellRing } from 'lucide-react'
import { useState } from 'react'
import { NotificationRuleForm } from './NotificationRuleForm'
import { NotificationRule } from '@/types'

export const NotificationRuleList = () => {
  const { notificationRules, deleteRule, currentUser, bus } = useUserStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<NotificationRule | undefined>(
    undefined,
  )

  const myRules = notificationRules.filter((r) => r.userId === currentUser?.id)

  const handleEdit = (rule: NotificationRule) => {
    setEditingRule(rule)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingRule(undefined)
    setIsModalOpen(true)
  }

  const getBUName = (buId: string) => {
    if (buId === 'ALL') return 'Todas as BUs'
    return bus.find((b) => b.id === buId)?.name || buId
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BellRing className="h-5 w-5" /> Regras Ativas
        </h2>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nova Regra
        </Button>
      </div>

      <div className="grid gap-4">
        {myRules.length === 0 ? (
          <Card className="border-dashed bg-gray-50">
            <CardContent className="py-8 text-center text-muted-foreground">
              Você não possui regras de notificação configuradas.
            </CardContent>
          </Card>
        ) : (
          myRules.map((rule) => (
            <Card key={rule.id} className="overflow-hidden">
              <div className="flex items-center p-4 gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{rule.name}</h3>
                    <Badge variant="secondary" className="text-[10px]">
                      {rule.triggerCondition === 'STATUS_RED' &&
                        'Status Crítico'}
                      {rule.triggerCondition === 'STATUS_CHANGE' &&
                        'Mudança de Status'}
                      {rule.triggerCondition === 'RETROACTIVE_EDIT' &&
                        'Edição Retroativa'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Escopo: <strong>{getBUName(rule.buId)}</strong> • Tipo:{' '}
                    {rule.kpiType === 'ALL' ? 'Todos' : rule.kpiType}
                  </p>
                  <div className="text-xs text-gray-500 flex gap-2">
                    <span>Canais:</span>
                    {rule.channels.map((c) => (
                      <span
                        key={c}
                        className="bg-gray-100 px-1.5 py-0.5 rounded"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(rule)}
                  >
                    <Edit className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-red-50 hover:text-red-600"
                    onClick={() => deleteRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {isModalOpen && (
        <NotificationRuleForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          existingRule={editingRule}
        />
      )}
    </div>
  )
}
