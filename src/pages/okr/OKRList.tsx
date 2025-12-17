import { useDataStore } from '@/stores/useDataStore'
import { useUserStore } from '@/stores/useUserStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export const OKRList = () => {
  const { okrs } = useDataStore()
  const { selectedBUId } = useUserStore()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOKRs = okrs.filter((okr) => {
    const matchesBU = selectedBUId === 'GLOBAL' || okr.buId === selectedBUId
    const matchesSearch = okr.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    return matchesBU && matchesSearch
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestão de OKRs</h1>
          <p className="text-muted-foreground">Objetivos e Resultados Chave</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Novo OKR
        </Button>
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
        {filteredOKRs.map((okr) => (
          <Card key={okr.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {okr.year} • Peso {okr.weight}
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
        ))}
        {filteredOKRs.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              Nenhum OKR encontrado para os filtros atuais.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
