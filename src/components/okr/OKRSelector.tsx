import { useState } from 'react'
import { Check, ChevronsUpDown, X, Target } from 'lucide-react'
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

interface OKRSelectorProps {
  selectedOkrIds: string[]
  onSelectionChange: (ids: string[]) => void
  buId?: string // Optional filter for suggestion
}

export const OKRSelector = ({
  selectedOkrIds,
  onSelectionChange,
  buId,
}: OKRSelectorProps) => {
  const { okrs } = useDataStore()
  const [open, setOpen] = useState(false)

  // Filter available OKRs - Show all or prioritize by BU if provided
  const availableOkrs = okrs.sort((a, b) => {
    if (buId) {
      if (a.buId === buId && b.buId !== buId) return -1
      if (a.buId !== buId && b.buId === buId) return 1
    }
    return a.title.localeCompare(b.title)
  })

  const selectedOkrs = okrs.filter((o) => selectedOkrIds.includes(o.id))

  const handleSelect = (okrId: string) => {
    if (selectedOkrIds.includes(okrId)) {
      onSelectionChange(selectedOkrIds.filter((id) => id !== okrId))
    } else {
      onSelectionChange([...selectedOkrIds, okrId])
    }
  }

  const handleRemove = (okrId: string) => {
    onSelectionChange(selectedOkrIds.filter((id) => id !== okrId))
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
              <span className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                Vincular OKR existente...
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar OKR..." />
              <CommandList>
                <CommandEmpty>Nenhum OKR encontrado.</CommandEmpty>
                <CommandGroup>
                  {availableOkrs.map((okr) => (
                    <CommandItem
                      key={okr.id}
                      value={okr.title}
                      onSelect={() => handleSelect(okr.id)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedOkrIds.includes(okr.id)
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="truncate">{okr.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {okr.buId} • {okr.startYear}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedOkrs.map((okr) => (
          <Badge
            key={okr.id}
            variant="outline"
            className="pl-2 pr-1 py-1 flex items-center gap-1 bg-purple-50 text-purple-900 border-purple-200"
          >
            <Target className="h-3 w-3" />
            <span className="truncate max-w-[200px]">{okr.title}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 hover:bg-transparent hover:text-red-500 rounded-full"
              onClick={() => handleRemove(okr.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  )
}
