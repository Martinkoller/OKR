import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useUserStore } from '@/stores/useUserStore'
import { useDataStore } from '@/stores/useDataStore'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  CornerDownRight,
  Loader2,
} from 'lucide-react'
import { BU } from '@/types'
import { useToast } from '@/hooks/use-toast'

const buSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  slug: z
    .string()
    .min(2, 'O código deve ter pelo menos 2 caracteres')
    .regex(
      /^[a-z0-9-]+$/,
      'O código deve conter apenas letras minúsculas, números e hífens',
    ),
  parentId: z.string().optional(),
})

export const BUHierarchyManager = () => {
  const {
    bus,
    addBU,
    updateBU,
    deleteBU,
    currentUser,
    fetchBUs,
    isAuthenticated,
  } = useUserStore()
  const { addAuditEntry } = useDataStore()
  const { toast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBU, setEditingBU] = useState<BU | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof buSchema>>({
    resolver: zodResolver(buSchema),
    defaultValues: {
      name: '',
      description: '',
      slug: '',
      parentId: 'none',
    },
  })

  useEffect(() => {
    fetchBUs()
  }, [fetchBUs])

  useEffect(() => {
    if (editingBU) {
      form.reset({
        name: editingBU.name,
        description: editingBU.description || '',
        slug: editingBU.slug,
        parentId: editingBU.parentId || 'none',
      })
    } else {
      form.reset({
        name: '',
        description: '',
        slug: '',
        parentId: 'none',
      })
    }
  }, [editingBU, form, isDialogOpen])

  const handleCreate = () => {
    setEditingBU(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (bu: BU) => {
    setEditingBU(bu)
    setIsDialogOpen(true)
  }

  const handleDelete = async (buId: string) => {
    if (!isAuthenticated) return

    const hasChildren = bus.some((b) => b.parentId === buId)
    if (hasChildren) {
      toast({
        title: 'Ação Bloqueada',
        description: 'Não é possível excluir uma BU que possui sub-unidades.',
        variant: 'destructive',
      })
      return
    }

    if (
      confirm(
        'Tem certeza que deseja excluir esta Unidade? Esta ação é irreversível.',
      )
    ) {
      try {
        await deleteBU(buId)
        if (currentUser) {
          addAuditEntry({
            entityId: buId,
            entityType: 'BU',
            action: 'DELETE',
            reason: 'Unidade de Negócio excluída',
            userId: currentUser.id,
          })
        }
        toast({ title: 'Unidade removida com sucesso' })
      } catch (error: any) {
        toast({
          title: 'Erro na Exclusão',
          description: error.message || 'Não foi possível excluir a unidade.',
          variant: 'destructive',
        })
      }
    }
  }

  const onSubmit = async (values: z.infer<typeof buSchema>) => {
    if (!isAuthenticated) {
      toast({
        title: 'Sessão Expirada',
        description: 'Faça login novamente para continuar.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    const buData: BU = {
      id: editingBU?.id || '',
      name: values.name,
      description: values.description,
      slug: values.slug,
      parentId: values.parentId === 'none' ? null : values.parentId,
      roleIds: [],
    }

    try {
      if (editingBU) {
        await updateBU(buData)
        if (currentUser) {
          addAuditEntry({
            entityId: buData.id,
            entityType: 'BU',
            action: 'UPDATE',
            reason: `BU "${values.name}" atualizada`,
            userId: currentUser.id,
          })
        }
        toast({ title: 'Unidade atualizada com sucesso' })
      } else {
        await addBU(buData)
        if (currentUser) {
          addAuditEntry({
            entityId: 'new-bu',
            entityType: 'BU',
            action: 'CREATE',
            reason: `Nova BU "${values.name}" criada`,
            userId: currentUser.id,
          })
        }
        toast({ title: 'Unidade criada com sucesso' })
      }
      setIsDialogOpen(false)
    } catch (error: any) {
      toast({
        title: 'Erro na Operação',
        description:
          error.message ||
          'Não foi possível salvar a unidade. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderRows = (parentId: string | null, depth: number = 0) => {
    const children = bus.filter(
      (b) =>
        b.parentId === (parentId || undefined) ||
        (parentId === null && !b.parentId),
    )

    if (
      children.length === 0 &&
      depth === 0 &&
      bus.length > 0 &&
      parentId === null
    ) {
      // Fallback for flat lists or corrupted hierarchy
      const roots = bus.filter((b) => !b.parentId)
      if (roots.length === 0) return null // Prevent infinite loop if cycle (shouldn't happen)
    }

    return children.map((bu) => (
      <>
        <TableRow
          key={bu.id}
          className="group hover:bg-muted/50 transition-colors"
        >
          <TableCell>
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${depth * 24}px` }}
            >
              {depth > 0 && (
                <CornerDownRight className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium">{bu.name}</span>
            </div>
            {bu.description && (
              <p
                className="text-xs text-muted-foreground mt-1 truncate max-w-[300px]"
                style={{ paddingLeft: `${depth > 0 ? depth * 24 + 20 : 0}px` }}
              >
                {bu.description}
              </p>
            )}
          </TableCell>
          <TableCell className="font-mono text-xs text-muted-foreground">
            {bu.slug}
          </TableCell>
          <TableCell>
            {bu.parentId ? (
              <Badge variant="outline" className="text-xs">
                {bus.find((b) => b.id === bu.parentId)?.name || '...'}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Raiz
              </Badge>
            )}
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(bu)}
                title="Editar"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDelete(bu.id)}
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {renderRows(bu.id, depth + 1)}
      </>
    ))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" /> Estrutura Organizacional
            </CardTitle>
            <CardDescription>
              Gerencie a hierarquia de Unidades de Negócio.
            </CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar BU
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Unidade de Negócio</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Reporta para</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bus.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Nenhuma unidade encontrada.
                </TableCell>
              </TableRow>
            ) : (
              renderRows(null)
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBU ? 'Editar Unidade' : 'Nova Unidade'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Unidade</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Varejo Sul"
                        {...field}
                        disabled={isSubmitting}
                      />
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
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição da unidade..."
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código (Slug)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: varejo-sul"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade Pai</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma (Raiz)</SelectItem>
                        {bus
                          .filter((b) => b.id !== editingBU?.id)
                          .map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
