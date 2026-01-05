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
import { Button } from '@/components/ui/button'
import { KPI } from '@/types'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import { useDataStore } from '@/stores/useDataStore'
import { useUserStore } from '@/stores/useUserStore'
import { usePermissions } from '@/hooks/usePermissions'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface KPIHistoryDialogProps {
  kpi: KPI
  isOpen: boolean
  onClose: () => void
}

export const KPIHistoryDialog = ({
  kpi,
  isOpen,
  onClose,
}: KPIHistoryDialogProps) => {
  const { deleteKPIMeasurement } = useDataStore()
  const { users, currentUser } = useUserStore()
  const { canDelete } = usePermissions()
  const { toast } = useToast()

  const [measurementToDelete, setMeasurementToDelete] = useState<string | null>(
    null,
  )

  const sortedHistory = [...kpi.history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const handleDelete = () => {
    if (!measurementToDelete || !currentUser) return

    deleteKPIMeasurement(kpi.id, measurementToDelete, currentUser.id)
    toast({
      title: 'Medição removida',
      description: 'O registro foi removido com sucesso.',
    })
    setMeasurementToDelete(null)
  }

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || userId
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Histórico de Medições</DialogTitle>
            <DialogDescription>
              Registro completo de valores lançados para {kpi.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data de Referência</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Comentário</TableHead>
                  <TableHead className="w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedHistory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhuma medição registrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedHistory.map((entry) => (
                    <TableRow key={entry.timestamp}>
                      <TableCell>
                        {format(parseISO(entry.date), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="font-bold">
                        {entry.value.toLocaleString()} {kpi.unit}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getUserName(entry.updatedByUserId)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {entry.comment || '-'}
                      </TableCell>
                      <TableCell>
                        {canDelete('KPI') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              setMeasurementToDelete(entry.timestamp)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!measurementToDelete}
        onOpenChange={(open) => !open && setMeasurementToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir medição?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá o valor do cálculo atual, mas o registro
              permanecerá no log de auditoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
