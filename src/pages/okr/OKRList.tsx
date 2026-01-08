import { useDataStore } from '@/stores/useDataStore'
import { useUserStore } from '@/stores/useUserStore'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, CalendarRange, Clock, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { OKR } from '@/types'
import { usePermissions } from '@/hooks/usePermissions'
import { OKRFormDialog } from '@/components/okr/OKRFormDialog'
import { BUFilter } from '@/components/dashboard/BUFilter'

export const OKRList = () => {
  const { okrs, fetchOKRs, isLoading } = useDataStore()
  const { selectedBUIds, isGlobalView } = useUserStore()
  const [searchTerm, setSearchTerm] = useState('')
  const { canCreate } = usePermissions()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchOKRs()
  }, [fetchOKRs])

  const isGlobal = isGlobalView()

  const filteredOKRs = okrs.filter((okr) => {
    const matchesBU = isGlobal || selectedBUIds.includes(okr.buId)
    const matchesSearch = okr.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    return matchesBU && matchesSearch
  })

  // Sort: Multi-year first, then by year
  const sortedOKRs = filteredOKRs.sort((a, b) => {
    if (a.scope === 'MULTI_YEAR' && b.scope !== 'MULTI_YEAR') return -1
    if (a.scope !== 'MULTI_YEAR' && b.scope === 'MULTI_YEAR') return 1
    return b.startYear - a.startYear
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestão de OKRs</h1>
          <p className="text-muted-foreground">Objetivos e Resultados Chave</p>
        </div>
        <div className="flex items-center gap-2">
          <BUFilter />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchOKRs()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
          {canCreate('OKR') && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Novo OKR
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6">
        {isLoading && okrs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Carregando OKRs...
          </div>
        ) : (
          sortedOKRs.map((okr: OKR) => (
            <Card key={okr.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      {okr.scope === 'MULTI_YEAR' ? (
                        <Badge
                          variant="secondary"
                          className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-0"
                        >
                          <CalendarRange className="w-3 h-3 mr-1" />
                          Plurianual {okr.startYear}-{okr.endYear}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-gray-600 border-gray-200"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          Ciclo {okr.startYear}
                        </Badge>
                      )}
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Peso {okr.weight}
                      </span>
                    </div>
                    <Link
                      to={`/okrs/${okr.id}`}
                      className="text-lg font-bold text-gray-900 hover:text-[#003366]"
                    >
                      {okr.title}
                    </Link>
                    <p className="text-sm text-gray-600 max-w-2xl">
                      {okr.description}
                    </p>
                  </div>

                  <div className="flex-1 md:max-w-xs space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-bold">{okr.progress}%</span>
                    </div>
                    <Progress value={okr.progress} className="h-2.5" />
                    <div className="flex justify-end">
                      <StatusBadge status={okr.status} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        {!isLoading && filteredOKRs.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              Nenhum OKR encontrado para os filtros atuais.
            </p>
          </div>
        )}
      </div>

      <OKRFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => fetchOKRs()}
      />
    </div>
  )
}
