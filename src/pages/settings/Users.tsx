import { useState } from 'react'
import { useUserStore } from '@/stores/useUserStore'
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
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  ShieldAlert,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserFormDialog } from '@/components/users/UserFormDialog'
import { useToast } from '@/hooks/use-toast'
import { User, Role } from '@/types'

export const Users = () => {
  const { users, currentUser, addUser, updateUser, deleteUser, bus } =
    useUserStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined)

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
      toast({
        title: 'Usuário atualizado',
        description: 'As alterações foram salvas com sucesso.',
      })
    } else {
      addUser({
        id: `u-${Date.now()}`,
        ...data,
        avatarUrl: `https://img.usecurling.com/ppl/medium?seed=${Date.now()}`,
      })
      toast({
        title: 'Usuário criado',
        description: 'Novo usuário adicionado ao sistema.',
      })
    }
    setIsDialogOpen(false)
  }

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'DIRECTOR_GENERAL':
        return <Badge className="bg-purple-600">Admin</Badge>
      case 'DIRECTOR_BU':
        return <Badge variant="secondary">Diretor BU</Badge>
      case 'GPM':
        return <Badge variant="outline">Gestor</Badge>
      case 'PM':
        return <Badge variant="outline">Gerente</Badge>
      case 'VIEWER':
        return (
          <Badge variant="outline" className="text-gray-500">
            Viewer
          </Badge>
        )
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  if (currentUser?.role !== 'DIRECTOR_GENERAL') {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-900">Acesso Negado</h1>
        <p className="text-muted-foreground max-w-md">
          Você não tem permissão para acessar esta página. Apenas
          administradores podem gerenciar usuários.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestão de Usuários
          </h1>
          <p className="text-muted-foreground">
            Administre contas, permissões e acesso às Unidades de Negócio.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Usuários Cadastrados</CardTitle>
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
          <CardDescription>
            Total de {filteredUsers.length} usuários encontrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Perfil</TableHead>
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
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.buIds.length === bus.length ? (
                        <Badge variant="secondary" className="text-[10px]">
                          Todas
                        </Badge>
                      ) : (
                        user.buIds.map((buId) => {
                          const buName = bus.find((b) => b.id === buId)?.name
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                          <Edit2 className="h-4 w-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        userToEdit={editingUser}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
