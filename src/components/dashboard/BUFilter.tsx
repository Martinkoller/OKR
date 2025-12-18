import { useState } from 'react'
import { Check, ChevronsUpDown, Building } from 'lucide-react'
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
import { useUserStore } from '@/stores/useUserStore'

export const BUFilter = () => {
  const {
    bus,
    selectedBUIds,
    setSelectedBUs,
    currentUser,
    getAllAccessibleBUIds,
  } = useUserStore()
  const [open, setOpen] = useState(false)

  // Filter BUs based on user access
  const accessibleBUIds = currentUser
    ? getAllAccessibleBUIds(currentUser.id)
    : []
  const availableBUs = bus.filter((b) => accessibleBUIds.includes(b.id))

  const handleSelect = (buId: string) => {
    if (buId === 'GLOBAL') {
      setSelectedBUs(['GLOBAL'])
    } else {
      let newSelection = [...selectedBUIds]
      if (newSelection.includes('GLOBAL')) {
        newSelection = []
      }

      if (newSelection.includes(buId)) {
        newSelection = newSelection.filter((id) => id !== buId)
      } else {
        newSelection.push(buId)
      }

      if (newSelection.length === 0) {
        newSelection = ['GLOBAL']
      }

      setSelectedBUs(newSelection)
    }
  }

  const isGlobal = selectedBUIds.includes('GLOBAL')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[280px] justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <Building className="h-4 w-4 shrink-0 opacity-50" />
            {isGlobal ? (
              <span>Visão Global</span>
            ) : (
              <div className="flex gap-1 truncate">
                {selectedBUIds.length === 1
                  ? availableBUs.find((b) => b.id === selectedBUIds[0])?.name
                  : `${selectedBUIds.length} unidades selecionadas`}
              </div>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Filtrar unidade..." />
          <CommandList>
            <CommandEmpty>Nenhuma unidade encontrada.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="global"
                onSelect={() => handleSelect('GLOBAL')}
                className="font-medium"
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    isGlobal ? 'opacity-100' : 'opacity-0',
                  )}
                />
                Visão Global (Todas)
              </CommandItem>
              {availableBUs.map((bu) => (
                <CommandItem
                  key={bu.id}
                  value={bu.name}
                  onSelect={() => handleSelect(bu.id)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedBUIds.includes(bu.id)
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                  {bu.name}
                  <span className="ml-auto text-xs text-muted-foreground uppercase">
                    {bu.slug}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
