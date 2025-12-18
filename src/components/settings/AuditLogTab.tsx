import { useDataStore } from '@/stores/useDataStore'
import { useUserStore } from '@/stores/useUserStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'
import { AuditAction, AuditEntity } from '@/types'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const AuditLogTab = () => {
  const { auditLogs } = useDataStore()
  const { users } = useUserStore()

  const [filterUser, setFilterUser] = useState<string>('ALL')
  const [filterAction, setFilterAction] = useState<string>('ALL')
  const [filterEntity, setFilterEntity] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLogs = auditLogs.filter((log) => {
    if (filterUser !== 'ALL' && log.userId !== filterUser) return false
    if (filterAction !== 'ALL' && log.action !== filterAction) return false
    if (filterEntity !== 'ALL' && log.entityType !== filterEntity) return false

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const reasonMatch = log.reason?.toLowerCase().includes(searchLower)
      const detailsMatch = log.details?.toLowerCase().includes(searchLower)
      const fieldMatch = log.field?.toLowerCase().includes(searchLower)
      return reasonMatch || detailsMatch || fieldMatch
    }

    return true
  })

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || userId
  }

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case 'CREATE':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Criar
          </Badge>
        )
      case 'UPDATE':
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Editar
          </Badge>
        )
      case 'DELETE':
        return <Badge variant="destructive">Excluir</Badge>
      case 'EXPORT':
        return <Badge variant="secondary">Exportar</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterUser} onValueChange={setFilterUser}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Usuário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos Usuários</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterEntity} onValueChange={setFilterEntity}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Módulo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos Módulos</SelectItem>
            <SelectItem value="OKR">OKR</SelectItem>
            <SelectItem value="KPI">KPI</SelectItem>
            <SelectItem value="ACTION_PLAN">Plano de Ação</SelectItem>
            <SelectItem value="USER">Usuário</SelectItem>
            <SelectItem value="ROLE">Função</SelectItem>
            <SelectItem value="REPORT">Relatório</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas Ações</SelectItem>
            <SelectItem value="CREATE">Criar</SelectItem>
            <SelectItem value="UPDATE">Editar</SelectItem>
            <SelectItem value="DELETE">Excluir</SelectItem>
            <SelectItem value="EXPORT">Exportar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Módulo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {getUserName(log.userId)}
                  </TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell className="text-xs font-mono">
                    {log.entityType}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-sm">
                    {log.reason || 'Ação registrada no sistema'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.field ? `Campo: ${log.field}` : '-'}
                    {log.oldValue && ` (${log.oldValue} → ${log.newValue})`}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
