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

const formSchema = z.object({
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  buId: z.string().min(1, 'Selecione uma Unidade de Negócio'),
  scope: z.enum(['ANNUAL', 'MULTI_YEAR']),
  startYear: z.string(),
  endYear: z.string(),
  weight: z.string().transform((val) => Number(val)),
  ownerId: z.string().min(1, 'Selecione um responsável'),
})

interface OKRFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export const OKRFormDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: OKRFormDialogProps) => {
  const { bus, users, currentUser } = useUserStore()
  const { addOKR } = useDataStore()
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
    },
  })

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        title: '',
        description: '',
        buId: '',
        scope: 'ANNUAL',
        startYear: currentYear,
        endYear: currentYear,
        weight: 1,
        ownerId: currentUser?.id || '',
      })
    }
  }, [open, form, currentYear, currentUser])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newOKR: OKR = {
      id: `okr-${Date.now()}`,
      title: values.title,
      description: values.description || '',
      buId: values.buId,
      scope: values.scope,
      startYear: parseInt(values.startYear),
      endYear: parseInt(values.endYear),
      weight: values.weight,
      ownerId: values.ownerId,
      kpiIds: [],
      progress: 0,
      status: 'GREEN', // Start green by default
    }

    if (currentUser) {
      addOKR(newOKR, currentUser.id)
      toast({
        title: 'OKR Criado',
        description: `O objetivo "${values.title}" foi criado com sucesso.`,
      })
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Novo Objetivo Estratégico (OKR)</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTemplateOpen(true)}
            >
              <FileText className="mr-2 h-4 w-4" /> Usar Modelo
            </Button>
          </DialogTitle>
          <DialogDescription>
            Defina o objetivo, escopo e responsabilidades.
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
              <Button type="submit">Criar OKR</Button>
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
