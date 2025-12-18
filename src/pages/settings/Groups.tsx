import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Users, Building, Plus, Edit2, Trash2, Shield } from 'lucide-react'
import { useUserStore } from '@/stores/useUserStore'
import { useDataStore } from '@/stores/useDataStore'
import { GroupFormDialog } from '@/components/settings/GroupFormDialog'
import { BUAccessDialog } from '@/components/settings/BUAccessDialog'
import { Group, BU } from '@/types'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export const Groups = () => {
  const {
    groups,
    bus,
    roles,
    users,
    addGroup,
    updateGroup,
    deleteGroup,
    updateUser,
    updateBURoles,
    currentUser,
  } = useUserStore()
  const { addAuditEntry } = useDataStore()
  const { toast } = useToast()

  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | undefined>(undefined)

  const [isBUDialogOpen, setIsBUDialogOpen] = useState(false)
  const [editingBU, setEditingBU] = useState<BU | undefined>(undefined)

  // Group Management Handlers
  const handleCreateGroup = () => {
    setEditingGroup(undefined)
    setIsGroupDialogOpen(true)
  }

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group)
    setIsGroupDialogOpen(true)
  }

  const handleDeleteGroup = (groupId: string) => {
    if (confirm('Tem certeza que deseja excluir este grupo?')) {
      deleteGroup(groupId)
      // Remove group from users
      users.forEach((u) => {
        if (u.groupIds?.includes(groupId)) {
          updateUser({
            ...u,
            groupIds: u.groupIds.filter((id) => id !== groupId),
          })
        }
      })

      if (currentUser) {
        addAuditEntry({
          entityId: groupId,
          entityType: 'GROUP',
          action: 'DELETE',
          reason: 'Grupo excluído',
          userId: currentUser.id,
        })
      }
      toast({ title: 'Grupo removido com sucesso' })
    }
  }

  const handleGroupSubmit = (group: Group, userIds: string[]) => {
    if (editingGroup) {
      updateGroup(group)
      // Update users logic
      // 1. Find all users currently in this group
      const currentMembers = users.filter((u) => u.groupIds?.includes(group.id))
      // 2. Identify users to remove
      currentMembers.forEach((u) => {
        if (!userIds.includes(u.id)) {
          updateUser({
            ...u,
            groupIds: u.groupIds?.filter((gid) => gid !== group.id),
          })
        }
      })
      // 3. Identify users to add
      userIds.forEach((uid) => {
        const user = users.find((u) => u.id === uid)
        if (user && !user.groupIds?.includes(group.id)) {
          updateUser({
            ...user,
            groupIds: [...(user.groupIds || []), group.id],
          })
        }
      })

      if (currentUser) {
        addAuditEntry({
          entityId: group.id,
          entityType: 'GROUP',
          action: 'UPDATE',
          reason: `Grupo "${group.name}" atualizado`,
          userId: currentUser.id,
        })
      }
      toast({ title: 'Grupo atualizado' })
    } else {
      addGroup(group)
      userIds.forEach((uid) => {
        const user = users.find((u) => u.id === uid)
        if (user) {
          updateUser({
            ...user,
            groupIds: [...(user.groupIds || []), group.id],
          })
        }
      })
      if (currentUser) {
        addAuditEntry({
          entityId: group.id,
          entityType: 'GROUP',
          action: 'CREATE',
          reason: `Grupo "${group.name}" criado`,
          userId: currentUser.id,
        })
      }
      toast({ title: 'Grupo criado' })
    }
  }

  // BU Management Handlers
  const handleEditBU = (bu: BU) => {
    setEditingBU(bu)
    setIsBUDialogOpen(true)
  }

  const handleBUSubmit = (roleIds: string[]) => {
    if (editingBU) {
      updateBURoles(editingBU.id, roleIds)
      if (currentUser) {
        addAuditEntry({
          entityId: editingBU.id,
          entityType: 'BU',
          action: 'UPDATE',
          reason: `Permissões da BU "${editingBU.name}" atualizadas`,
          userId: currentUser.id,
        })
      }
      toast({ title: 'Permissões da BU atualizadas' })
    }
  }

  const getRoleNames = (roleIds?: string[]) => {
    if (!roleIds || roleIds.length === 0) return '-'
    return roleIds
      .map((rid) => roles.find((r) => r.id === rid)?.name)
      .filter(Boolean)
      .join(', ')
  }

  const getMemberCount = (groupId: string) => {
    return users.filter((u) => u.groupIds?.includes(groupId)).length
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Grupos & Acesso</h1>
        <p className="text-muted-foreground">
          Gerencie grupos de acesso e permissões herdadas por Unidades de
          Negócio.
        </p>
      </div>

      <Tabs defaultValue="groups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="groups" className="gap-2">
            <Users className="h-4 w-4" /> Grupos de Acesso
          </TabsTrigger>
          <TabsTrigger value="bus" className="gap-2">
            <Building className="h-4 w-4" /> Unidades de Negócio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Grupos Personalizados</CardTitle>
                <CardDescription>
                  Crie grupos para atribuir funções a múltiplos usuários.
                </CardDescription>
              </div>
              <Button onClick={handleCreateGroup}>
                <Plus className="mr-2 h-4 w-4" /> Novo Grupo
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Funções (Roles)</TableHead>
                    <TableHead className="text-center">Membros</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Nenhum grupo criado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    groups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">
                          {group.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {group.description}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {group.roleIds.length > 0 ? (
                              group.roleIds.map((rid) => (
                                <Badge
                                  key={rid}
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  {roles.find((r) => r.id === rid)?.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                Nenhuma
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {getMemberCount(group.id)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditGroup(group)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteGroup(group.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bus">
          <Card>
            <CardHeader>
              <CardTitle>Permissões por Unidade de Negócio</CardTitle>
              <CardDescription>
                Atribua funções que serão herdadas automaticamente por todos os
                usuários de uma BU.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unidade (BU)</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Funções Herdadas</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bus.map((bu) => (
                    <TableRow key={bu.id}>
                      <TableCell className="font-medium">{bu.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {bu.slug.toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {bu.roleIds && bu.roleIds.length > 0 ? (
                            bu.roleIds.map((rid) => (
                              <Badge
                                key={rid}
                                variant="secondary"
                                className="text-[10px]"
                              >
                                {roles.find((r) => r.id === rid)?.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              -
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditBU(bu)}
                        >
                          <Shield className="h-4 w-4 mr-2" /> Gerenciar Acesso
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <GroupFormDialog
        isOpen={isGroupDialogOpen}
        onClose={() => setIsGroupDialogOpen(false)}
        onSubmit={handleGroupSubmit}
        groupToEdit={editingGroup}
      />

      {editingBU && (
        <BUAccessDialog
          isOpen={isBUDialogOpen}
          onClose={() => setIsBUDialogOpen(false)}
          onSubmit={handleBUSubmit}
          bu={editingBU}
        />
      )}
    </div>
  )
}
