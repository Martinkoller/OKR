import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Template } from '@/types'
import { Calculator, Database, Variable } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const formSchema = z.object({
  title: z.string().min(3, 'O título é obrigatório'),
  description: z.string().optional(),
  type: z.enum(['OKR', 'KPI']),
  formula: z.string().optional(),
  unit: z.string().optional(),
  frequency: z
    .enum(['MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'SEMESTERLY'])
    .optional(),
  kpiType: z.enum(['QUANT', 'QUAL']).optional(),
  scope: z.enum(['ANNUAL', 'MULTI_YEAR']).optional(),
})

interface TemplateFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  templateToEdit?: Template
}

export const TemplateFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  templateToEdit,
}: TemplateFormDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'KPI',
      formula: '',
      unit: '',
      frequency: 'MONTHLY',
      kpiType: 'QUANT',
      scope: 'ANNUAL',
    },
  })

  const [formulaValue, setFormulaValue] = useState('')

  useEffect(() => {
    if (templateToEdit) {
      form.reset({
        title: templateToEdit.title,
        description: templateToEdit.description,
        type: templateToEdit.type,
        formula: templateToEdit.formula || '',
        unit: templateToEdit.unit || '',
        frequency: templateToEdit.frequency,
        kpiType: templateToEdit.kpiType,
        scope: templateToEdit.scope,
      })
      setFormulaValue(templateToEdit.formula || '')
    } else {
      form.reset({
        title: '',
        description: '',
        type: 'KPI',
        formula: '',
        unit: '',
        frequency: 'MONTHLY',
        kpiType: 'QUANT',
        scope: 'ANNUAL',
      })
      setFormulaValue('')
    }
  }, [templateToEdit, isOpen, form])

  // Sync internal state with form
  const handleFormulaChange = (val: string) => {
    setFormulaValue(val)
    form.setValue('formula', val)
  }

  const insertPlaceholder = (placeholder: string) => {
    const newVal = formulaValue + placeholder
    handleFormulaChange(newVal)
  }

  const templateType = form.watch('type')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {templateToEdit ? 'Editar Modelo' : 'Novo Modelo'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Receita Recorrente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Entidade</FormLabel>
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
                          <SelectItem value="KPI">KPI</SelectItem>
                          <SelectItem value="OKR">OKR</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Explique o modelo..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {templateType === 'KPI' && (
                <>
                  <div className="space-y-2 border rounded-md p-4 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <FormLabel className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Construtor de Fórmulas Dinâmicas
                      </FormLabel>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => insertPlaceholder('[KPI:Ref]')}
                            >
                              <Variable className="h-3 w-3 mr-1" /> KPI
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Referência a outro KPI
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => insertPlaceholder('[EXT:Source]')}
                            >
                              <Database className="h-3 w-3 mr-1" /> External
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Placeholder para dado externo
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="formula"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Ex: ([KPI:Novos] / [EXT:Total]) * 100"
                                {...field}
                                value={formulaValue}
                                onChange={(e) =>
                                  handleFormulaChange(e.target.value)
                                }
                                className="font-mono"
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs">
                            Utilize variáveis para cálculos complexos. Suporta
                            operações básicas (+, -, *, /).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidade</FormLabel>
                          <FormControl>
                            <Input placeholder="%, R$" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequência Padrão</FormLabel>
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
                              <SelectItem value="QUARTERLY">
                                Trimestral
                              </SelectItem>
                              <SelectItem value="SEMESTERLY">
                                Semestral
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              {templateType === 'OKR' && (
                <FormField
                  control={form.control}
                  name="scope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Escopo Padrão</FormLabel>
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
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Modelo</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
