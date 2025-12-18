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
import {
  format,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'
import { AuditAction, AuditEntity } from '@/types'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

export const AuditLogTab = () => {
  const { auditLogs } = useDataStore()
  const { users, bus } = useUserStore()

  const [filterUser, setFilterUser] = useState<string>('ALL')
  const [filterAction, setFilterAction] = useState<string>('ALL')
  const [filterEntity, setFilterEntity] = useState<string>('ALL')
  const [filterBU, setFilterBU] = useState<string>('ALL')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLogs = auditLogs.filter((log) => {
    // Basic Filters
    if (filterUser !== 'ALL' && log.userId !== filterUser) return false
    if (filterAction !== 'ALL' && log.action !== filterAction) return false
    if (filterEntity !== 'ALL' && log.entityType !== filterEntity) return false

    // Search Term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const reasonMatch = log.reason?.toLowerCase().includes(searchLower)
      const detailsMatch = log.details?.toLowerCase().includes(searchLower)
      const fieldMatch = log.field?.toLowerCase().includes(searchLower)
      if (!reasonMatch && !detailsMatch && !fieldMatch) return false
    }

    // Date Range
    if (startDate || endDate) {
      const logDate = parseISO(log.timestamp)
      const start = startDate ? startOfDay(parseISO(startDate)) : new Date(0)
      const end = endDate
        ? endOfDay(parseISO(endDate))
        : new Date(8640000000000000)

      if (!isWithinInterval(logDate, { start, end })) return false
    }

    // BU Filter (Indirect via User)
    if (filterBU !== 'ALL') {
      const user = users.find((u) => u.id === log.userId)
      // Check if user belongs to selected BU or if BU is ALL
      if (!user || !user.buIds.includes(filterBU)) return false
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
      case 'ACCESS':
        return (
          <Badge variant="outline" className="text-gray-500">
            Acesso
          </Badge>
        )
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={filterUser} onValueChange={setFilterUser}>
          <SelectTrigger>
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

        <Select value={filterBU} onValueChange={setFilterBU}>
          <SelectTrigger>
            <SelectValue placeholder="Unidade de Negócio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas Unidades</SelectItem>
            {bus.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de Ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas Ações</SelectItem>
            <SelectItem value="ACCESS">Acesso / Login</SelectItem>
            <SelectItem value="CREATE">Criação</SelectItem>
            <SelectItem value="UPDATE">Edição</SelectItem>
            <SelectItem value="DELETE">Exclusão</SelectItem>
            <SelectItem value="EXPORT">Exportação</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 col-span-1 md:col-span-2">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1 block">
              De
            </Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1 block">
              Até
            </Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Entidade</TableHead>
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
              filteredLogs.slice(0, 100).map((log) => (
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
                    {log.reason || '-'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                    {log.details ? (
                      log.details
                    ) : (
                      <>
                        {log.field ? `Campo: ${log.field}` : ''}
                        {log.oldValue && ` (${log.oldValue} → ${log.newValue})`}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {filteredLogs.length > 100 && (
          <div className="p-2 text-center text-xs text-muted-foreground border-t">
            Exibindo os 100 registros mais recentes de {filteredLogs.length}.
          </div>
        )}
      </div>
    </div>
  )
}
