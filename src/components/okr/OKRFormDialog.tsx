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
import { OKR, Template } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { TemplateSelector } from '@/components/templates/TemplateSelector'
import { KPISelector } from '@/components/okr/KPISelector'

const formSchema = z.object({
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  buId: z.string().min(1, 'Selecione uma Unidade de Negócio'),
  scope: z.enum(['ANNUAL', 'MULTI_YEAR']),
  startYear: z.string(),
  endYear: z.string(),
  weight: z.string().transform((val) => Number(val)),
  ownerId: z.string().min(1, 'Selecione um responsável'),
  kpiIds: z.array(z.string()).default([]),
})

interface OKRFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  okrToEdit?: OKR
}

export const OKRFormDialog = ({
  open,
  onOpenChange,
  onSuccess,
  okrToEdit,
}: OKRFormDialogProps) => {
  const { bus, users, currentUser } = useUserStore()
  const { addOKR, updateOKR, kpis } = useDataStore()
  const { toast } = useToast()
  const [isTemplateOpen, setIsTemplateOpen] = useState(false)

  const currentYear = new Date().getFullYear().toString()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      buId: '',
      scope: 'ANNUAL',
      startYear: currentYear,
      endYear: currentYear,
      weight: 1,
      ownerId: '',
      kpiIds: [],
    },
  })

  // Watch BU ID to filter KPI suggestions
  const selectedBUId = form.watch('buId')

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (okrToEdit) {
        form.reset({
          title: okrToEdit.title,
          description: okrToEdit.description,
          buId: okrToEdit.buId,
          scope: okrToEdit.scope,
          startYear: okrToEdit.startYear.toString(),
          endYear: okrToEdit.endYear.toString(),
          weight: okrToEdit.weight,
          ownerId: okrToEdit.ownerId,
          kpiIds: okrToEdit.kpiIds,
        })
      } else {
        form.reset({
          title: '',
          description: '',
          buId: '',
          scope: 'ANNUAL',
          startYear: currentYear,
          endYear: currentYear,
          weight: 1,
          ownerId: currentUser?.id || '',
          kpiIds: [],
        })
      }
    }
  }, [open, form, currentYear, currentUser, okrToEdit])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Basic calculation of initial progress if creating new
    // If editing, the updateOKR action handles it in store now (we updated store)
    let initialProgress = 0
    let initialStatus: any = 'GREEN'

    if (!okrToEdit && values.kpiIds.length > 0) {
      // Manual calc for creation display
      // Real calc happens in store/usage
    } else if (okrToEdit) {
      initialProgress = okrToEdit.progress
      initialStatus = okrToEdit.status
    }

    const okrData: OKR = {
      id: okrToEdit?.id || `okr-${Date.now()}`,
      title: values.title,
      description: values.description || '',
      buId: values.buId,
      scope: values.scope,
      startYear: parseInt(values.startYear),
      endYear: parseInt(values.endYear),
      weight: values.weight,
      ownerId: values.ownerId,
      kpiIds: values.kpiIds,
      progress: initialProgress,
      status: initialStatus,
    }

    if (currentUser) {
      if (okrToEdit) {
        updateOKR(okrData, currentUser.id)
        toast({
          title: 'OKR Atualizado',
          description: 'As alterações foram salvas com sucesso.',
        })
      } else {
        addOKR(okrData, currentUser.id)
        toast({
          title: 'OKR Criado',
          description: `O objetivo "${values.title}" foi criado com sucesso.`,
        })
      }
      onOpenChange(false)
      onSuccess?.()
    }
  }

  const handleTemplateSelect = (template: Template) => {
    form.setValue('title', template.title)
    form.setValue('description', template.description)
    if (template.scope) {
      form.setValue('scope', template.scope)
    }
    setIsTemplateOpen(false)
    toast({
      title: 'Modelo Carregado',
      description: 'Os campos foram preenchidos com o modelo selecionado.',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>
              {okrToEdit
                ? 'Editar Objetivo Estratégico'
                : 'Novo Objetivo Estratégico (OKR)'}
            </span>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsTemplateOpen(true)}
            >
              <FileText className="mr-2 h-4 w-4" /> Usar Modelo
            </Button>
          </DialogTitle>
          <DialogDescription>
            Defina o objetivo, escopo e KPIs associados.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Objetivo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Expandir market share" {...field} />
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
                    <Textarea
                      placeholder="Detalhes sobre a estratégia..."
                      {...field}
                    />
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

            <div className="space-y-2 border rounded-md p-4 bg-gray-50/50">
              <FormLabel>Associação de KPIs (Key Results)</FormLabel>
              <FormDescription className="mb-2">
                Vincule os indicadores que medirão o sucesso deste objetivo.
              </FormDescription>
              <FormField
                control={form.control}
                name="kpiIds"
                render={({ field }) => (
                  <FormItem>
                    <KPISelector
                      selectedKpiIds={field.value}
                      onSelectionChange={field.onChange}
                      buId={selectedBUId}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Escopo Temporal</FormLabel>
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
                        <SelectItem value="ANNUAL">Anual</SelectItem>
                        <SelectItem value="MULTI_YEAR">Plurianual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso Estratégico (1-100)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano Início</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano Fim</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
              <Button type="submit">
                {okrToEdit ? 'Salvar Alterações' : 'Criar OKR'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <TemplateSelector
        type="OKR"
        isOpen={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
        onSelect={handleTemplateSelect}
      />
    </Dialog>
  )
}
