import { useDataStore } from '@/stores/useDataStore'
import { useUserStore } from '@/stores/useUserStore'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePermissions } from '@/hooks/usePermissions'
import { KPIFormDialog } from '@/components/kpi/KPIFormDialog'
import { BUFilter } from '@/components/dashboard/BUFilter'
import { formatFrequency, formatNumber } from '@/lib/formatters'

export const KPIList = () => {
  const { kpis } = useDataStore()
  const { selectedBUIds, isGlobalView, users } = useUserStore()
  const [searchTerm, setSearchTerm] = useState('')
  const isMobile = useIsMobile()
  const { canCreate } = usePermissions()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const isGlobal = isGlobalView()

  // Filter out deleted
  const activeKPIs = kpis.filter((k) => !k.deletedAt)

  const filteredKPIs = activeKPIs.filter((kpi) => {
    const matchesBU = isGlobal || selectedBUIds.includes(kpi.buId)
    const matchesSearch = kpi.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    return matchesBU && matchesSearch
  })

  const getOwnerName = (ownerId: string) => {
    return users.find((u) => u.id === ownerId)?.name || ownerId
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventário de KPIs</h1>
          <p className="text-muted-foreground">Monitoramento de indicadores</p>
        </div>
        <div className="flex gap-2">
          <BUFilter />
          <Button variant="outline" className="hidden sm:flex">
            <Filter className="mr-2 h-4 w-4" /> Filtros
          </Button>
          {canCreate('KPI') && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Novo KPI
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar KPI..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isMobile ? (
            <div className="divide-y">
              {filteredKPIs.map((kpi) => (
                <div key={kpi.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <Link
                      to={`/kpis/${kpi.id}`}
                      className="font-semibold text-blue-600"
                    >
                      {kpi.name}
                    </Link>
                    <StatusBadge status={kpi.status} className="text-xs" />
                  </div>
                  <div className="text-sm text-gray-500 grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-xs text-muted-foreground">
                        Atual
                      </span>
                      <span className="font-medium">
                        {formatNumber(kpi.currentValue, kpi.unit)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-muted-foreground">
                        Responsável
                      </span>
                      <span className="font-medium text-xs">
                        {getOwnerName(kpi.ownerId)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredKPIs.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  Nenhum KPI encontrado.
                </div>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Nome</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Valor Atual</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKPIs.map((kpi) => (
                  <TableRow key={kpi.id} className="group hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link
                        to={`/kpis/${kpi.id}`}
                        className="hover:underline hover:text-[#003366]"
                      >
                        {kpi.name}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                        {kpi.description}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatFrequency(kpi.frequency)}
                    </TableCell>
                    <TableCell>{formatNumber(kpi.goal, kpi.unit)}</TableCell>
                    <TableCell className="font-bold">
                      {formatNumber(kpi.currentValue, kpi.unit)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {getOwnerName(kpi.ownerId)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={kpi.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/kpis/${kpi.id}`}>Detalhes</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredKPIs.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nenhum KPI encontrado para os filtros selecionados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <KPIFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {}}
      />
    </div>
  )
}
