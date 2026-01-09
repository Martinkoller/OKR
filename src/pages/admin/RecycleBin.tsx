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
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, RotateCcw, Search, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'

export const RecycleBin = () => {
  const {
    deletedOkrs,
    deletedKpis,
    fetchRecycleBin,
    restoreOKR,
    restoreKPI,
    isRecycleBinLoading,
  } = useDataStore()
  const { currentUser } = useUserStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [isRestoring, setIsRestoring] = useState<string | null>(null)

  useEffect(() => {
    fetchRecycleBin()
  }, [fetchRecycleBin])

  const allDeleted = [
    ...deletedOkrs.map((o) => ({ ...o, entityType: 'OKR' as const })),
    ...deletedKpis.map((k) => ({ ...k, entityType: 'KPI' as const })),
  ]

  const filteredItems = allDeleted.filter((item) => {
    const name = 'title' in item ? item.title : item.name
    return name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleRestore = async (item: (typeof filteredItems)[0]) => {
    if (!currentUser) return

    setIsRestoring(item.id)
    try {
      if (item.entityType === 'OKR') {
        await restoreOKR(item.id, currentUser.id)
      } else {
        await restoreKPI(item.id, currentUser.id)
      }

      toast({
        title: 'Item Restaurado',
        description: `${item.entityType} recuperado com sucesso.`,
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: `Não foi possível restaurar o ${item.entityType}.`,
        variant: 'destructive',
      })
    } finally {
      setIsRestoring(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" /> Lixeira (Itens
              Excluídos)
            </CardTitle>
            <CardDescription>
              Gerencie e restaure registros removidos do sistema.
            </CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar itens excluídos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Nome / Título</TableHead>
                <TableHead>Data de Exclusão</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isRecycleBinLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Carregando lixeira...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    A lixeira está vazia.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="outline">{item.entityType}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {'title' in item ? item.title : item.name}
                    </TableCell>
                    <TableCell>
                      {item.deletedAt &&
                        format(new Date(item.deletedAt), "d 'de' MMM, HH:mm", {
                          locale: ptBR,
                        })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleRestore(item)}
                        disabled={isRestoring === item.id}
                      >
                        {isRestoring === item.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="mr-2 h-4 w-4" />
                        )}
                        Restaurar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
