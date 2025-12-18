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
import { RoleDefinition } from '@/types'
import { PermissionsMatrix } from './PermissionsMatrix'

interface RoleFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (role: RoleDefinition) => void
  roleToEdit?: RoleDefinition
}

export const RoleFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  roleToEdit,
}: RoleFormDialogProps) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [permissions, setPermissions] = useState<RoleDefinition['permissions']>(
    {
      OKR: [],
      KPI: [],
      REPORT: [],
      SETTINGS: [],
    },
  )

  useEffect(() => {
    if (roleToEdit) {
      setName(roleToEdit.name)
      setDescription(roleToEdit.description)
      setPermissions(roleToEdit.permissions)
    } else {
      setName('')
      setDescription('')
      setPermissions({
        OKR: ['VIEW'],
        KPI: ['VIEW'],
        REPORT: ['VIEW'],
        SETTINGS: [],
      })
    }
  }, [roleToEdit, isOpen])

  const handleSubmit = () => {
    const role: RoleDefinition = {
      id: roleToEdit?.id || `role-${Date.now()}`,
      name,
      description,
      permissions,
      isSystem: roleToEdit?.isSystem || false,
    }
    onSubmit(role)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {roleToEdit ? 'Editar Função' : 'Nova Função'}
          </DialogTitle>
          <DialogDescription>
            Defina o nome e as permissões de acesso para esta função.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Função</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Auditor de Dados"
                disabled={roleToEdit?.isSystem}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o propósito desta função..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Matriz de Permissões</Label>
            <PermissionsMatrix
              permissions={permissions}
              onChange={setPermissions}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar Função</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
