import { AuditEntry } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FileEdit, Plus, Trash2 } from 'lucide-react'

interface AuditLogTimelineProps {
  logs: AuditEntry[]
  className?: string
}

export const AuditLogTimeline = ({
  logs,
  className,
}: AuditLogTimelineProps) => {
  if (logs.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        Nenhum registro de auditoria encontrado.
      </div>
    )
  }

  return (
    <ScrollArea className={className}>
      <div className="space-y-6 pl-2">
        {logs.map((log) => (
          <div key={log.id} className="relative flex gap-4 group">
            {/* Timeline Line */}
            <div className="absolute left-[19px] top-10 bottom-[-24px] w-px bg-border group-last:hidden" />

            {/* Icon */}
            <div className="relative z-10 h-10 w-10 shrink-0 rounded-full border bg-background flex items-center justify-center shadow-sm">
              {log.action === 'CREATE' && (
                <Plus className="h-4 w-4 text-green-600" />
              )}
              {log.action === 'UPDATE' && (
                <FileEdit className="h-4 w-4 text-blue-600" />
              )}
              {log.action === 'DELETE' && (
                <Trash2 className="h-4 w-4 text-red-600" />
              )}
            </div>

            <div className="flex-1 space-y-1 py-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {log.action === 'CREATE' && 'Criação de registro'}
                  {log.action === 'UPDATE' && 'Atualização de registro'}
                  {log.action === 'DELETE' && 'Remoção de registro'}
                </p>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(log.timestamp), "d 'de' MMM, HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>

              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {log.entityType}:{' '}
                </span>
                <span>{log.reason || 'Sem motivo especificado'}</span>
              </div>

              {(log.oldValue !== undefined || log.newValue !== undefined) && (
                <div className="mt-2 rounded-md bg-muted/50 p-3 text-xs grid grid-cols-2 gap-2 border">
                  <div>
                    <span className="block text-muted-foreground mb-1">
                      Anterior
                    </span>
                    <span className="font-mono font-medium">
                      {log.oldValue ?? '-'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground mb-1">
                      Novo
                    </span>
                    <span className="font-mono font-medium text-foreground">
                      {log.newValue ?? '-'}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mt-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage
                    src={`https://img.usecurling.com/ppl/thumbnail?seed=${log.userId}`}
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  Usuário ID: {log.userId}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
