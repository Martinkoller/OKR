import { useState } from 'react'
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { useDataStore } from '@/stores/useDataStore'
import { KPIFormDialog } from '@/components/kpi/KPIFormDialog'
import { KPI } from '@/types'

interface KPISelectorProps {
  selectedKpiIds: string[]
  onSelectionChange: (ids: string[]) => void
  buId?: string // Optional filter for suggestion
}

export const KPISelector = ({
  selectedKpiIds,
  onSelectionChange,
  buId,
}: KPISelectorProps) => {
  const { kpis } = useDataStore()
  const [open, setOpen] = useState(false)
  const [isKPIDialogOpen, setIsKPIDialogOpen] = useState(false)

  // Filter available KPIs - Show all or prioritize by BU if provided
  const availableKpis = kpis.sort((a, b) => {
    if (buId) {
      if (a.buId === buId && b.buId !== buId) return -1
      if (a.buId !== buId && b.buId === buId) return 1
    }
    return a.name.localeCompare(b.name)
  })

  const selectedKpis = kpis.filter((k) => selectedKpiIds.includes(k.id))

  const handleSelect = (kpiId: string) => {
    if (selectedKpiIds.includes(kpiId)) {
      onSelectionChange(selectedKpiIds.filter((id) => id !== kpiId))
    } else {
      onSelectionChange([...selectedKpiIds, kpiId])
    }
  }

  const handleRemove = (kpiId: string) => {
    onSelectionChange(selectedKpiIds.filter((id) => id !== kpiId))
  }

  const handleKPICreated = (kpi: KPI) => {
    onSelectionChange([...selectedKpiIds, kpi.id])
    setIsKPIDialogOpen(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              Adicionar KPI existente...
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar KPI..." />
              <CommandList>
                <CommandEmpty>Nenhum KPI encontrado.</CommandEmpty>
                <CommandGroup>
                  {availableKpis.map((kpi) => (
                    <CommandItem
                      key={kpi.id}
                      value={kpi.name}
                      onSelect={() => handleSelect(kpi.id)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedKpiIds.includes(kpi.id)
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{kpi.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {kpi.buId} • {kpi.unit}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsKPIDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> Novo KPI
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedKpis.map((kpi) => (
          <Badge
            key={kpi.id}
            variant="secondary"
            className="pl-2 pr-1 py-1 flex items-center gap-1"
          >
            {kpi.name}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 hover:bg-transparent hover:text-red-500 rounded-full"
              onClick={() => handleRemove(kpi.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        {selectedKpis.length === 0 && (
          <span className="text-sm text-muted-foreground">
            Nenhum KPI vinculado.
          </span>
        )}
      </div>

      <KPIFormDialog
        open={isKPIDialogOpen}
        onOpenChange={setIsKPIDialogOpen}
        onSuccess={handleKPICreated}
        defaultValues={{ buId }}
      />
    </div>
  )
}
