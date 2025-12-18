import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUserStore } from '@/stores/useUserStore'
import { useDataStore } from '@/stores/useDataStore'
import { KPI, Template } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { TemplateSelector } from '@/components/templates/TemplateSelector'

const formSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  buId: z.string().min(1, 'Selecione uma Unidade de Negócio'),
  ownerId: z.string().min(1, 'Selecione um responsável'),
  frequency: z.enum(['MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'SEMESTERLY']),
  type: z.enum(['QUANT', 'QUAL']),
  unit: z.string().min(1, 'Unidade de medida obrigatória'),
  goal: z.string().transform((val) => Number(val)),
  weight: z.string().transform((val) => Number(val)),
})

interface KPIFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export const KPIFormDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: KPIFormDialogProps) => {
  const { bus, users, currentUser } = useUserStore()
  const { addKPI } = useDataStore()
  const { toast } = useToast()
  const [isTemplateOpen, setIsTemplateOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      buId: '',
      ownerId: '',
      frequency: 'MONTHLY',
      type: 'QUANT',
      unit: '',
      goal: 0,
      weight: 10,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: '',
        description: '',
        buId: '',
        ownerId: currentUser?.id || '',
        frequency: 'MONTHLY',
        type: 'QUANT',
        unit: '',
        goal: 0,
        weight: 10,
      })
    }
  }, [open, form, currentUser])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newKPI: KPI = {
      id: `kpi-${Date.now()}`,
      name: values.name,
      description: values.description || '',
      buId: values.buId,
      ownerId: values.ownerId,
      frequency: values.frequency,
      type: values.type,
      unit: values.unit,
      goal: values.goal,
      weight: values.weight,
      currentValue: 0,
      status: 'RED', // Starts red as current value is 0
      lastUpdated: new Date().toISOString(),
      history: [],
    }

    if (currentUser) {
      addKPI(newKPI, currentUser.id)
      toast({
        title: 'KPI Criado',
        description: `O indicador "${values.name}" foi registrado.`,
      })
      onOpenChange(false)
      onSuccess?.()
    }
  }

  const handleTemplateSelect = (template: Template) => {
    form.setValue('name', template.title)
    form.setValue('description', template.description)
    if (template.frequency) form.setValue('frequency', template.frequency)
    if (template.kpiType) form.setValue('type', template.kpiType)
    if (template.unit) form.setValue('unit', template.unit)
    if (template.suggestedGoal) form.setValue('goal', template.suggestedGoal)

    setIsTemplateOpen(false)
    toast({
      title: 'Modelo Carregado',
      description: 'Os campos foram preenchidos com o modelo selecionado.',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Novo Indicador de Desempenho (KPI)</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTemplateOpen(true)}
            >
              <FileText className="mr-2 h-4 w-4" /> Usar Modelo
            </Button>
          </DialogTitle>
          <DialogDescription>
            Configure as métricas e metas do indicador.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do KPI</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Receita Recorrente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="O que este KPI mede?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="buId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade de Negócio</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bus.map((bu) => (
                          <SelectItem key={bu.id} value={bu.id}>
                            {bu.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável (Owner)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequência</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Mensal</SelectItem>
                        <SelectItem value="BIMONTHLY">Bimestral</SelectItem>
                        <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                        <SelectItem value="SEMESTERLY">Semestral</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="QUANT">Quantitativo</SelectItem>
                        <SelectItem value="QUAL">Qualitativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <Input placeholder="%, R$, pts" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (0-100)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Criar KPI</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <TemplateSelector
        type="KPI"
        isOpen={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
        onSelect={handleTemplateSelect}
      />
    </Dialog>
  )
}
