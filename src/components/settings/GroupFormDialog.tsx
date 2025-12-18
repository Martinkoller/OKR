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
import { Group } from '@/types'
import { useUserStore } from '@/stores/useUserStore'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface GroupFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (group: Group, userIds: string[]) => void
  groupToEdit?: Group
}

export const GroupFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  groupToEdit,
}: GroupFormDialogProps) => {
  const { roles, users } = useUserStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  useEffect(() => {
    if (groupToEdit) {
      setName(groupToEdit.name)
      setDescription(groupToEdit.description)
      setSelectedRoleIds(groupToEdit.roleIds || [])
      // Find users who are in this group
      const members = users
        .filter((u) => u.groupIds?.includes(groupToEdit.id))
        .map((u) => u.id)
      setSelectedUserIds(members)
    } else {
      setName('')
      setDescription('')
      setSelectedRoleIds([])
      setSelectedUserIds([])
    }
  }, [groupToEdit, isOpen, users])

  const handleSubmit = () => {
    const group: Group = {
      id: groupToEdit?.id || `grp-${Date.now()}`,
      name,
      description,
      roleIds: selectedRoleIds,
      createdAt: groupToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onSubmit(group, selectedUserIds)
    onClose()
  }

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    )
  }

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {groupToEdit ? 'Editar Grupo' : 'Novo Grupo'}
          </DialogTitle>
          <DialogDescription>
            Configure o grupo, suas permissões e membros.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Grupo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Consultores Externos"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o propósito deste grupo..."
              />
            </div>
          </div>

          <Tabs defaultValue="roles">
            <TabsList className="w-full">
              <TabsTrigger value="roles" className="flex-1">
                Funções & Permissões
              </TabsTrigger>
              <TabsTrigger value="members" className="flex-1">
                Membros
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roles" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Selecione as funções que serão herdadas por todos os membros
                deste grupo.
              </p>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                <div className="space-y-2">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-start space-x-2 p-2 hover:bg-muted/50 rounded"
                    >
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={selectedRoleIds.includes(role.id)}
                        onCheckedChange={() => toggleRole(role.id)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor={`role-${role.id}`}
                          className="font-semibold cursor-pointer"
                        >
                          {role.name}
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          {role.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {selectedRoleIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedRoleIds.map((rid) => (
                    <Badge key={rid} variant="secondary">
                      {roles.find((r) => r.id === rid)?.name}
                    </Badge>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="members" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Selecione os usuários que farão parte deste grupo.
              </p>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded"
                    >
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={selectedUserIds.includes(user.id)}
                        onCheckedChange={() => toggleUser(user.id)}
                      />
                      <Label
                        htmlFor={`user-${user.id}`}
                        className="cursor-pointer"
                      >
                        {user.name}{' '}
                        <span className="text-xs text-muted-foreground">
                          ({user.email})
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="text-xs text-muted-foreground text-right">
                {selectedUserIds.length} usuários selecionados
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar Grupo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
