import { useState, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ActionPlan,
  ActionPlanTask,
  ActionPlanStatus,
  TaskStatus,
} from '@/types'
import { useUserStore } from '@/stores/useUserStore'
import { useDataStore } from '@/stores/useDataStore'
import { Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ActionPlanModalProps {
  isOpen: boolean
  onClose: () => void
  entityId: string
  entityType: 'KPI' | 'OKR'
  existingPlan?: ActionPlan
}

export const ActionPlanModal = ({
  isOpen,
  onClose,
  entityId,
  entityType,
  existingPlan,
}: ActionPlanModalProps) => {
  const { currentUser, users } = useUserStore()
  const { saveActionPlan } = useDataStore()
  const { toast } = useToast()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<ActionPlanStatus>('DRAFT')
  const [dueDate, setDueDate] = useState('')
  const [tasks, setTasks] = useState<ActionPlanTask[]>([])
  const [justification, setJustification] = useState('')

  useEffect(() => {
    if (existingPlan) {
      setTitle(existingPlan.title)
      setDescription(existingPlan.description)
      setStatus(existingPlan.status)
      setDueDate(existingPlan.dueDate)
      setTasks(existingPlan.tasks)
    } else {
      setTitle('')
      setDescription('')
      setStatus('DRAFT')
      setDueDate('')
      setTasks([])
      setJustification('')
    }
  }, [existingPlan, isOpen])

  const canEdit =
    currentUser?.role === 'GPM' ||
    currentUser?.role === 'PM' ||
    currentUser?.role === 'DIRECTOR_BU'

  const handleSave = () => {
    if (!title || !dueDate) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Por favor, preencha o título e a data alvo.',
        variant: 'destructive',
      })
      return
    }

    if (status === 'CANCELLED' && !justification) {
      toast({
        title: 'Justificativa Obrigatória',
        description: 'Para cancelar um plano, é necessário informar o motivo.',
        variant: 'destructive',
      })
      return
    }

    const plan: ActionPlan = {
      id: existingPlan?.id || `ap-${Date.now()}`,
      title,
      description,
      entityId,
      entityType,
      status,
      dueDate,
      ownerId: currentUser?.id || 'unknown',
      tasks,
      createdAt: existingPlan?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    saveActionPlan(plan, currentUser?.id || 'system')
    toast({
      title: existingPlan ? 'Plano Atualizado' : 'Plano Criado',
      description: 'As alterações foram salvas com sucesso.',
    })
    onClose()
  }

  const addTask = () => {
    const newTask: ActionPlanTask = {
      id: `t-${Date.now()}`,
      description: '',
      ownerId: '',
      deadline: '',
      status: 'PENDING',
    }
    setTasks([...tasks, newTask])
  }

  const updateTask = (
    index: number,
    field: keyof ActionPlanTask,
    value: any,
  ) => {
    const newTasks = [...tasks]
    newTasks[index] = { ...newTasks[index], [field]: value }
    setTasks(newTasks)
  }

  const removeTask = (index: number) => {
    const newTasks = [...tasks]
    newTasks.splice(index, 1)
    setTasks(newTasks)
  }

  if (!canEdit) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {existingPlan ? 'Editar Plano de Ação' : 'Novo Plano de Ação'}
          </DialogTitle>
          <DialogDescription>
            Defina as ações corretivas para o {entityType}.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Plano</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Recuperação de Meta Q3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status do Plano</Label>
                <Select
                  value={status}
                  onValueChange={(val: ActionPlanStatus) => setStatus(val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Rascunho</SelectItem>
                    <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                    <SelectItem value="COMPLETED">Concluído</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Data Alvo</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <div className="h-10 flex items-center px-3 border rounded-md bg-muted text-sm">
                  {currentUser?.name}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição / Estratégia</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva a estratégia geral para correção..."
              />
            </div>

            {status === 'CANCELLED' && (
              <div className="space-y-2 p-4 bg-red-50 border border-red-200 rounded-md">
                <Label htmlFor="justification" className="text-red-700">
                  Justificativa de Cancelamento (Obrigatório)
                </Label>
                <Textarea
                  id="justification"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Por que este plano está sendo cancelado?"
                  className="bg-white"
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Tarefas</Label>
                <Button size="sm" variant="outline" onClick={addTask}>
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Tarefa
                </Button>
              </div>

              {tasks.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed rounded-md text-muted-foreground text-sm">
                  Nenhuma tarefa definida.
                </div>
              )}

              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="p-4 border rounded-md space-y-3 bg-gray-50/50"
                >
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Descrição da Tarefa</Label>
                      <Input
                        value={task.description}
                        onChange={(e) =>
                          updateTask(index, 'description', e.target.value)
                        }
                        placeholder="O que precisa ser feito?"
                      />
                    </div>
                    <div className="w-8 flex items-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeTask(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Responsável</Label>
                      <Select
                        value={task.ownerId}
                        onValueChange={(val) =>
                          updateTask(index, 'ownerId', val)
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Prazo</Label>
                      <Input
                        type="date"
                        className="h-9"
                        value={task.deadline}
                        onChange={(e) =>
                          updateTask(index, 'deadline', e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Status</Label>
                      <Select
                        value={task.status}
                        onValueChange={(val: TaskStatus) =>
                          updateTask(index, 'status', val)
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pendente</SelectItem>
                          <SelectItem value="DONE">Feito</SelectItem>
                          <SelectItem value="OVERDUE">Atrasado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Plano</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
