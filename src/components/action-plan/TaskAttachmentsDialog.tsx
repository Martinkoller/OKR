import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ActionPlanTask, Attachment } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { File, Download, Trash2, Upload, Paperclip } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TaskAttachmentsDialogProps {
  isOpen: boolean
  onClose: () => void
  task: ActionPlanTask
  onUpdateTask: (task: ActionPlanTask) => void
  isReadOnly?: boolean
}

export const TaskAttachmentsDialog = ({
  isOpen,
  onClose,
  task,
  onUpdateTask,
  isReadOnly,
}: TaskAttachmentsDialogProps) => {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    // Simulate upload delay
    setTimeout(() => {
      const newAttachment: Attachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        url: URL.createObjectURL(file), // Mock URL
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }

      const updatedAttachments = [...(task.attachments || []), newAttachment]
      onUpdateTask({ ...task, attachments: updatedAttachments })

      setIsUploading(false)
      toast({
        title: 'Arquivo anexado',
        description: `${file.name} foi adicionado com sucesso.`,
      })
    }, 800)
  }

  const handleDelete = (attachmentId: string) => {
    if (isReadOnly) return
    const updatedAttachments = (task.attachments || []).filter(
      (a) => a.id !== attachmentId,
    )
    onUpdateTask({ ...task, attachments: updatedAttachments })
    toast({ title: 'Anexo removido' })
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Anexos da Tarefa
          </DialogTitle>
          <DialogDescription>
            Documentação de suporte para: "{task.description}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="border rounded-md min-h-[200px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Arquivo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!task.attachments || task.attachments.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum arquivo anexado.
                    </TableCell>
                  </TableRow>
                )}
                {task.attachments?.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-blue-500" />
                        <span
                          className="truncate max-w-[150px]"
                          title={file.name}
                        >
                          {file.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(file.uploadedAt), 'dd/MM/yy HH:mm', {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {formatSize(file.size)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <a
                            href={file.url}
                            download={file.name}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        {!isReadOnly && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {!isReadOnly && (
            <div className="flex items-center justify-end">
              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <Button asChild disabled={isUploading}>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {isUploading ? (
                      'Enviando...'
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" /> Adicionar Arquivo
                      </>
                    )}
                  </label>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
