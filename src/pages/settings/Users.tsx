import { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { useUserStore } from '@/stores/useUserStore'
import { useDataStore } from '@/stores/useDataStore'
import { usePermissions } from '@/hooks/usePermissions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Plus, MoreHorizontal, Edit2, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserFormDialog } from '@/components/users/UserFormDialog'
import { useToast } from '@/hooks/use-toast'
import { User } from '@/types'
import { RolesTab } from '@/components/settings/RolesTab'
import { AuditLogTab } from '@/components/settings/AuditLogTab'

export const Users = () => {
  const {
    users,
    currentUser,
    addUser,
    updateUser,
    deleteUser,
    bus,
    roles,
    groups,
  } = useUserStore()
  const { addAuditEntry } = useDataStore()
  const { checkPermission } = usePermissions()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined)

  const hasAccess = checkPermission('SETTINGS', 'VIEW')
  const canEditUsers = checkPermission('SETTINGS', 'EDIT')
  const canCreateUsers = checkPermission('SETTINGS', 'CREATE')
  const canDeleteUsers = checkPermission('SETTINGS', 'DELETE')

  if (!hasAccess && currentUser?.role !== 'DIRECTOR_GENERAL') {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-900">Acesso Negado</h1>
        <p className="text-muted-foreground max-w-md">
          Você não tem permissão para acessar as configurações de usuários.
        </p>
      </div>
    )
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreate = () => {
    setEditingUser(undefined)
    setIsDialogOpen(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsDialogOpen(true)
  }

  const handleDelete = (userId: string) => {
    if (confirm('Tem certeza que deseja remover este usuário?')) {
      deleteUser(userId)
      if (currentUser) {
        addAuditEntry({
          entityId: userId,
          entityType: 'USER',
          action: 'DELETE',
          reason: 'Usuário removido',
          userId: currentUser.id,
        })
      }
      toast({
        title: 'Usuário removido',
        description: 'O usuário foi excluído com sucesso.',
      })
    }
  }

  const handleFormSubmit = (data: any) => {
    if (editingUser) {
      updateUser({
        ...editingUser,
        ...data,
        id: editingUser.id,
      })
      if (currentUser) {
        addAuditEntry({
          entityId: editingUser.id,
          entityType: 'USER',
          action: 'UPDATE',
          reason: `Usuário ${data.name} atualizado`,
          userId: currentUser.id,
        })
      }
      toast({
        title: 'Usuário atualizado',
        description: 'As alterações foram salvas com sucesso.',
      })
    } else {
      const newId = `u-${Date.now()}`
      addUser({
        id: newId,
        ...data,
        avatarUrl: `https://img.usecurling.com/ppl/medium?seed=${Date.now()}`,
      })
      if (currentUser) {
        addAuditEntry({
          entityId: newId,
          entityType: 'USER',
          action: 'CREATE',
          reason: `Usuário ${data.name} criado`,
          userId: currentUser.id,
        })
      }
      toast({
        title: 'Usuário criado',
        description: 'Novo usuário adicionado ao sistema.',
      })
    }
    setIsDialogOpen(false)
  }

  const getRoleName = (roleId: string) => {
    return roles.find((r) => r.id === roleId)?.name || roleId
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestão do Sistema</h1>
        <p className="text-muted-foreground">
          Administração de usuários, permissões e auditoria.
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="roles">Funções e Permissões</TabsTrigger>
          <TabsTrigger value="audit">Log de Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Usuários Cadastrados</h2>
            {canCreateUsers && (
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" /> Novo Usuário
              </Button>
            )}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Listagem de Usuários
                </CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou e-mail..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Perfil Direto</TableHead>
                    <TableHead>Grupos</TableHead>
                    <TableHead>BUs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback>
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getRoleName(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {user.groupIds && user.groupIds.length > 0 ? (
                            user.groupIds.map((gid) => (
                              <Badge
                                key={gid}
                                variant="secondary"
                                className="text-[10px]"
                              >
                                {groups.find((g) => g.id === gid)?.name || gid}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              -
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {user.buIds.length === bus.length ? (
                            <Badge variant="secondary" className="text-[10px]">
                              Todas
                            </Badge>
                          ) : (
                            user.buIds.map((buId) => {
                              const buName = bus.find(
                                (b) => b.id === buId,
                              )?.name
                              return (
                                <Badge
                                  key={buId}
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  {buName || buId}
                                </Badge>
                              )
                            })
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.active ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-0 hover:bg-emerald-200">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground"
                          >
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {(canEditUsers || canDeleteUsers) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canEditUsers && (
                                <DropdownMenuItem
                                  onClick={() => handleEdit(user)}
                                >
                                  <Edit2 className="h-4 w-4 mr-2" /> Editar
                                </DropdownMenuItem>
                              )}
                              {canDeleteUsers && (
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => handleDelete(user.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Remover
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <RolesTab />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogTab />
        </TabsContent>
      </Tabs>

      <UserFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        userToEdit={editingUser}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
