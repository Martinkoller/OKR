import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDataStore } from '@/stores/useDataStore'
import { Template, TemplateType } from '@/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check } from 'lucide-react'

interface TemplateSelectorProps {
  type: TemplateType
  isOpen: boolean
  onClose: () => void
  onSelect: (template: Template) => void
}

export const TemplateSelector = ({
  type,
  isOpen,
  onClose,
  onSelect,
}: TemplateSelectorProps) => {
  const { templates } = useDataStore()
  const filteredTemplates = templates.filter((t) => t.type === type)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Biblioteca de Modelos - {type}</DialogTitle>
          <DialogDescription>
            Selecione um modelo pré-definido para acelerar a criação.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="grid md:grid-cols-2 gap-4 py-4">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-primary transition-colors flex flex-col"
                onClick={() => onSelect(template)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex justify-between items-start gap-2">
                    {template.title}
                    {template.kpiType && (
                      <Badge variant="secondary" className="text-[10px]">
                        {template.kpiType}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2 flex-1">
                  {template.suggestedMetrics && (
                    <div>
                      <strong>Sugestões:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {template.suggestedMetrics.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {template.unit && (
                    <div>
                      Unidade: <strong>{template.unit}</strong>
                    </div>
                  )}
                  <div className="mt-auto pt-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-primary"
                    >
                      <Check className="mr-2 h-3 w-3" /> Usar Modelo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredTemplates.length === 0 && (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                Nenhum modelo disponível para este tipo.
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
