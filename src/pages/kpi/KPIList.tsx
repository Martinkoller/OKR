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

export const KPIList = () => {
  const { kpis } = useDataStore()
  const { selectedBUId } = useUserStore()
  const [searchTerm, setSearchTerm] = useState('')
  const isMobile = useIsMobile()
  const { canCreate } = usePermissions()

  const filteredKPIs = kpis.filter((kpi) => {
    const matchesBU = selectedBUId === 'GLOBAL' || kpi.buId === selectedBUId
    const matchesSearch = kpi.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    return matchesBU && matchesSearch
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventário de KPIs</h1>
          <p className="text-muted-foreground">Monitoramento de indicadores</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filtros
          </Button>
          {canCreate('KPI') && (
            <Button>
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
                        {kpi.currentValue} {kpi.unit}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-muted-foreground">
                        Meta
                      </span>
                      <span className="font-medium">
                        {kpi.goal} {kpi.unit}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Nome</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Valor Atual</TableHead>
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
                    <TableCell className="text-xs uppercase">
                      {kpi.frequency}
                    </TableCell>
                    <TableCell>
                      {kpi.goal}{' '}
                      <span className="text-xs text-muted-foreground">
                        {kpi.unit}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold">
                      {kpi.currentValue}{' '}
                      <span className="text-xs font-normal text-muted-foreground">
                        {kpi.unit}
                      </span>
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
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
