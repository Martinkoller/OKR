import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { AuditEntry } from '@/types'
import { useDataStore } from '@/stores/useDataStore'
import { useUserStore } from '@/stores/useUserStore'
import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowRight, GitCompare, History } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VersionComparisonProps {
  entityId: string
  entityType: 'KPI' | 'OKR'
  isOpen: boolean
  onClose: () => void
}

export const VersionComparison = ({
  entityId,
  entityType,
  isOpen,
  onClose,
}: VersionComparisonProps) => {
  const { auditLogs } = useDataStore()
  const { users } = useUserStore()

  const [selectedLogs, setSelectedLogs] = useState<string[]>([])

  // Filter logs for this entity, sort by date desc
  const logs = auditLogs
    .filter((l) => l.entityId === entityId)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )

  const handleSelect = (id: string) => {
    if (selectedLogs.includes(id)) {
      setSelectedLogs(selectedLogs.filter((logId) => logId !== id))
    } else {
      if (selectedLogs.length < 2) {
        setSelectedLogs([...selectedLogs, id])
      } else {
        // Replace the oldest selection or just simple queue?
        // Let's replace the first one
        setSelectedLogs([selectedLogs[1], id])
      }
    }
  }

  const getUserName = (userId: string) =>
    users.find((u) => u.id === userId)?.name || userId

  const getLogById = (id: string) => logs.find((l) => l.id === id)

  // Determine comparison data
  const showComparison = selectedLogs.length === 2
  const logA = showComparison ? getLogById(selectedLogs[1]) : null // Newest
  const logB = showComparison ? getLogById(selectedLogs[0]) : null // Oldest (assuming user clicked in order or list order)

  // Sort selected so A is newer than B usually
  const sortedSelection = selectedLogs
    .map((id) => getLogById(id))
    .sort(
      (a, b) =>
        new Date(b!.timestamp).getTime() - new Date(a!.timestamp).getTime(),
    ) as AuditEntry[]

  const newerLog = sortedSelection[0]
  const olderLog = sortedSelection[1]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" /> Histórico de Versões e Comparação
          </DialogTitle>
          <DialogDescription>
            Selecione duas versões para comparar as mudanças lado a lado.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="border rounded-md overflow-y-auto max-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Comparar</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Campo</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-4 text-muted-foreground"
                    >
                      Sem histórico registrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow
                      key={log.id}
                      className={cn(
                        selectedLogs.includes(log.id) && 'bg-blue-50',
                      )}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedLogs.includes(log.id)}
                          onCheckedChange={() => handleSelect(log.id)}
                          disabled={
                            !selectedLogs.includes(log.id) &&
                            selectedLogs.length >= 2
                          }
                        />
                      </TableCell>
                      <TableCell className="text-xs">
                        {format(new Date(log.timestamp), 'dd/MM/yy HH:mm')}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">
                        {log.action}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {log.field || '-'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {getUserName(log.userId)}
                      </TableCell>
                      <TableCell className="text-xs truncate max-w-[150px]">
                        {log.reason}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex-1 border-t pt-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <GitCompare className="h-4 w-4" /> Comparação Detalhada
            </h3>
            {!showComparison ? (
              <div className="flex items-center justify-center h-[150px] bg-muted/20 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                Selecione dois registros na tabela acima para visualizar as
                diferenças.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 h-[200px] overflow-y-auto">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground border-b pb-1">
                    Versão Anterior (
                    {format(new Date(olderLog.timestamp), 'dd/MM/yy HH:mm')})
                  </div>
                  <div className="p-3 bg-red-50 border border-red-100 rounded-md text-sm">
                    {olderLog.action === 'UPDATE' && olderLog.field ? (
                      <div>
                        <span className="font-semibold">{olderLog.field}:</span>{' '}
                        <span className="line-through text-red-700">
                          {olderLog.oldValue ?? '(vazio)'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        Não há valor anterior específico registrado neste log de{' '}
                        {olderLog.action}.
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      Motivo: {olderLog.reason}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground border-b pb-1">
                    Versão Mais Recente (
                    {format(new Date(newerLog.timestamp), 'dd/MM/yy HH:mm')})
                  </div>
                  <div className="p-3 bg-green-50 border border-green-100 rounded-md text-sm">
                    {newerLog.action === 'UPDATE' && newerLog.field ? (
                      <div>
                        <span className="font-semibold">{newerLog.field}:</span>{' '}
                        <span className="text-green-700 font-medium">
                          {newerLog.newValue ?? '(vazio)'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        Valor registrado neste log: {newerLog.newValue}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      Motivo: {newerLog.reason}
                    </div>
                  </div>
                </div>

                <div className="col-span-2 text-center mt-2">
                  <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">
                    <ArrowRight className="h-3 w-3" />
                    Comparando modificações sequenciais no histórico
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
