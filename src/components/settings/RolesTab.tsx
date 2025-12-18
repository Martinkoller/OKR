import { useState } from 'react'
import { useUserStore } from '@/stores/useUserStore'
import { useDataStore } from '@/stores/useDataStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, Shield } from 'lucide-react'
import { RoleDefinition } from '@/types'
import { RoleFormDialog } from './RoleFormDialog'
import { useToast } from '@/hooks/use-toast'

export const RolesTab = () => {
  const { roles, addRole, updateRole, deleteRole, currentUser } = useUserStore()
  const { addAuditEntry } = useDataStore()
  const { toast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleDefinition | undefined>(
    undefined,
  )

  const handleCreate = () => {
    setEditingRole(undefined)
    setIsDialogOpen(true)
  }

  const handleEdit = (role: RoleDefinition) => {
    setEditingRole(role)
    setIsDialogOpen(true)
  }

  const handleDelete = (roleId: string) => {
    if (confirm('Tem certeza que deseja excluir esta função?')) {
      deleteRole(roleId)
      if (currentUser) {
        addAuditEntry({
          entityId: roleId,
          entityType: 'ROLE',
          action: 'DELETE',
          reason: 'Função excluída',
          userId: currentUser.id,
        })
      }
      toast({
        title: 'Função excluída',
        description: 'A função foi removida com sucesso.',
      })
    }
  }

  const handleFormSubmit = (role: RoleDefinition) => {
    if (editingRole) {
      updateRole(role)
      if (currentUser) {
        addAuditEntry({
          entityId: role.id,
          entityType: 'ROLE',
          action: 'UPDATE',
          reason: `Função "${role.name}" atualizada`,
          userId: currentUser.id,
        })
      }
      toast({ title: 'Função atualizada' })
    } else {
      addRole(role)
      if (currentUser) {
        addAuditEntry({
          entityId: role.id,
          entityType: 'ROLE',
          action: 'CREATE',
          reason: `Nova função "${role.name}" criada`,
          userId: currentUser.id,
        })
      }
      toast({ title: 'Função criada' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Funções e Permissões</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie os níveis de acesso e permissões granulares do sistema.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nova Função
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id} className="relative group">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base">{role.name}</CardTitle>
                </div>
                {role.isSystem && (
                  <Badge variant="secondary" className="text-[10px]">
                    Sistema
                  </Badge>
                )}
              </div>
              <CardDescription className="line-clamp-2 min-h-[40px]">
                {role.description}
              </CardDescription>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(role)}
                >
                  <Edit2 className="h-3 w-3 mr-2" /> Editar
                </Button>
                {!role.isSystem && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(role.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <RoleFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleFormSubmit}
        roleToEdit={editingRole}
      />
    </div>
  )
}
