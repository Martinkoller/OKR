import { useState } from 'react'
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
import { Label } from '@/components/ui/label'
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
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, FolderTree, CornerDownRight } from 'lucide-react'
import { BU } from '@/types'
import { useToast } from '@/hooks/use-toast'

export const BUHierarchyManager = () => {
  const { bus, addBU, updateBU, deleteBU, currentUser } = useUserStore()
  const { addAuditEntry } = useDataStore()
  const { toast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBU, setEditingBU] = useState<BU | undefined>(undefined)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [parentId, setParentId] = useState<string>('none')

  const handleCreate = () => {
    setEditingBU(undefined)
    setName('')
    setSlug('')
    setParentId('none')
    setIsDialogOpen(true)
  }

  const handleEdit = (bu: BU) => {
    setEditingBU(bu)
    setName(bu.name)
    setSlug(bu.slug)
    setParentId(bu.parentId || 'none')
    setIsDialogOpen(true)
  }

  const handleDelete = (buId: string) => {
    // Prevent delete if has children
    const hasChildren = bus.some((b) => b.parentId === buId)
    if (hasChildren) {
      toast({
        title: 'Ação Bloqueada',
        description: 'Não é possível excluir uma BU que possui sub-unidades.',
        variant: 'destructive',
      })
      return
    }

    if (confirm('Tem certeza que deseja excluir esta Unidade?')) {
      deleteBU(buId)
      if (currentUser) {
        addAuditEntry({
          entityId: buId,
          entityType: 'BU',
          action: 'DELETE',
          reason: 'Unidade de Negócio excluída',
          userId: currentUser.id,
        })
      }
      toast({ title: 'Unidade removida' })
    }
  }

  const handleSubmit = () => {
    if (!name || !slug) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Preencha nome e código da unidade.',
        variant: 'destructive',
      })
      return
    }

    const buData: BU = {
      id: editingBU?.id || `bu-${Date.now()}`,
      name,
      slug,
      parentId: parentId === 'none' ? null : parentId,
      roleIds: editingBU?.roleIds || [],
    }

    if (editingBU) {
      updateBU(buData)
      if (currentUser) {
        addAuditEntry({
          entityId: buData.id,
          entityType: 'BU',
          action: 'UPDATE',
          reason: `BU "${name}" atualizada`,
          userId: currentUser.id,
        })
      }
      toast({ title: 'Unidade atualizada' })
    } else {
      addBU(buData)
      if (currentUser) {
        addAuditEntry({
          entityId: buData.id,
          entityType: 'BU',
          action: 'CREATE',
          reason: `Nova BU "${name}" criada`,
          userId: currentUser.id,
        })
      }
      toast({ title: 'Unidade criada' })
    }
    setIsDialogOpen(false)
  }

  // Recursive render for tree structure
  const renderRows = (parentId: string | null, depth: number = 0) => {
    const children = bus.filter(
      (b) =>
        b.parentId === (parentId || undefined) ||
        (parentId === null && !b.parentId),
    )

    return children.map((bu) => (
      <>
        <TableRow key={bu.id} className="group">
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
          </TableCell>
          <TableCell className="font-mono text-xs text-muted-foreground">
            {bu.slug.toUpperCase()}
          </TableCell>
          <TableCell>
            {bu.parentId ? (
              <Badge variant="outline" className="text-xs">
                {bus.find((b) => b.id === bu.parentId)?.name}
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
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDelete(bu.id)}
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
              Gerencie a hierarquia de Unidades de Negócio. Permissões são
              herdadas de unidades pai para filhas.
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
              <TableHead>Unidade de Negócio</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Reporta para (Pai)</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderRows(null)}</TableBody>
        </Table>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBU ? 'Editar Unidade' : 'Nova Unidade'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome da Unidade</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Varejo Sul"
              />
            </div>
            <div className="grid gap-2">
              <Label>Código (Slug)</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Ex: varejo-sul"
              />
            </div>
            <div className="grid gap-2">
              <Label>Unidade Pai (Hierarquia)</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma (Raiz)</SelectItem>
                  {bus
                    .filter((b) => b.id !== editingBU?.id) // Prevent self-parenting
                    .map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
