import { useState } from 'react'
import { useDataStore } from '@/stores/useDataStore'
import { useUserStore } from '@/stores/useUserStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, Copy, FileText } from 'lucide-react'
import { Template } from '@/types'
import { TemplateFormDialog } from './TemplateFormDialog'
import { useToast } from '@/hooks/use-toast'

export const TemplateManager = () => {
  const { templates, addTemplate, updateTemplate, deleteTemplate } =
    useDataStore()
  const { currentUser } = useUserStore()
  const { toast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | undefined>(
    undefined,
  )

  const handleCreate = () => {
    setEditingTemplate(undefined)
    setIsDialogOpen(true)
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setIsDialogOpen(true)
  }

  const handleDelete = (templateId: string) => {
    if (confirm('Tem certeza que deseja excluir este modelo?')) {
      deleteTemplate(templateId, currentUser?.id || 'unknown')
      toast({ title: 'Modelo excluído com sucesso.' })
    }
  }

  const handleSubmit = (data: any) => {
    const templateData: Template = {
      id: editingTemplate?.id || `tpl-${Date.now()}`,
      title: data.title,
      description: data.description,
      type: data.type,
      formula: data.formula,
      unit: data.unit,
      frequency: data.frequency,
      kpiType: data.kpiType,
      scope: data.scope,
      suggestedMetrics: [], // Not in form for simplicity
    }

    if (editingTemplate) {
      updateTemplate(templateData, currentUser?.id || 'unknown')
      toast({ title: 'Modelo atualizado.' })
    } else {
      addTemplate(templateData, currentUser?.id || 'unknown')
      toast({ title: 'Modelo criado.' })
    }
    setIsDialogOpen(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Biblioteca de Modelos</CardTitle>
          <CardDescription>
            Padronize a criação de OKRs e KPIs com modelos pré-configurados.
          </CardDescription>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Novo Modelo
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="relative group">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <CardTitle className="text-base truncate">
                      {template.title}
                    </CardTitle>
                  </div>
                  <Badge variant="outline">{template.type}</Badge>
                </div>
                <CardDescription className="line-clamp-2 min-h-[40px] text-xs mt-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground pb-4">
                {template.formula && (
                  <div className="mb-2 p-2 bg-muted rounded font-mono">
                    {template.formula}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {template.unit && (
                    <Badge variant="secondary">{template.unit}</Badge>
                  )}
                  {template.frequency && (
                    <Badge variant="secondary">{template.frequency}</Badge>
                  )}
                  {template.scope && (
                    <Badge variant="secondary">{template.scope}</Badge>
                  )}
                </div>
              </CardContent>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEdit(template)}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(template.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
          {templates.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              Nenhum modelo cadastrado.
            </div>
          )}
        </div>
      </CardContent>

      <TemplateFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        templateToEdit={editingTemplate}
      />
    </Card>
  )
}
