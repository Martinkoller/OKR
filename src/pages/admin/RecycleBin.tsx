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
import { Trash2, RotateCcw, Search } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'

export const RecycleBin = () => {
  const { okrs, kpis, restoreOKR, restoreKPI } = useDataStore()
  const { currentUser } = useUserStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')

  const deletedOKRs = okrs.filter((o) => o.deletedAt)
  const deletedKPIs = kpis.filter((k) => k.deletedAt)

  const allDeleted = [
    ...deletedOKRs.map((o) => ({ ...o, entityType: 'OKR' as const })),
    ...deletedKPIs.map((k) => ({ ...k, entityType: 'KPI' as const })),
  ]

  const filteredItems = allDeleted.filter((item) => {
    const name = 'title' in item ? item.title : item.name
    return name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleRestore = (item: (typeof filteredItems)[0]) => {
    if (!currentUser) return

    if (item.entityType === 'OKR') {
      restoreOKR(item.id, currentUser.id)
    } else {
      restoreKPI(item.id, currentUser.id)
    }

    toast({
      title: 'Item Restaurado',
      description: `${item.entityType} recuperado com sucesso.`,
    })
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
              {filteredItems.length === 0 ? (
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
                      >
                        <RotateCcw className="mr-2 h-4 w-4" /> Restaurar
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
