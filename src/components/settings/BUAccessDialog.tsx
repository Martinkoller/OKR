import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { BU } from '@/types'
import { useUserStore } from '@/stores/useUserStore'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface BUAccessDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (roleIds: string[]) => void
  bu: BU
}

export const BUAccessDialog = ({
  isOpen,
  onClose,
  onSubmit,
  bu,
}: BUAccessDialogProps) => {
  const { roles } = useUserStore()
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])

  useEffect(() => {
    if (bu) {
      setSelectedRoleIds(bu.roleIds || [])
    }
  }, [bu, isOpen])

  const handleSubmit = () => {
    onSubmit(selectedRoleIds)
    onClose()
  }

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Acesso: {bu.name}</DialogTitle>
          <DialogDescription>
            Atribua funções que serão herdadas automaticamente por todos os
            usuários pertencentes à unidade <strong>{bu.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Label>Funções Herdadas</Label>
          <ScrollArea className="h-[300px] border rounded-md p-2">
            <div className="space-y-2">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-start space-x-2 p-2 hover:bg-muted/50 rounded"
                >
                  <Checkbox
                    id={`bu-role-${role.id}`}
                    checked={selectedRoleIds.includes(role.id)}
                    onCheckedChange={() => toggleRole(role.id)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor={`bu-role-${role.id}`}
                      className="font-semibold cursor-pointer"
                    >
                      {role.name}
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {role.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          {selectedRoleIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedRoleIds.map((rid) => (
                <Badge key={rid} variant="secondary">
                  {roles.find((r) => r.id === rid)?.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar Permissões</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
