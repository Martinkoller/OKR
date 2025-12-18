import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PermissionModule, PermissionAction } from '@/types'

const MODULES: { key: PermissionModule; label: string }[] = [
  { key: 'OKR', label: 'Objetivos (OKRs)' },
  { key: 'KPI', label: 'Indicadores (KPIs)' },
  { key: 'REPORT', label: 'Relatórios & Analytics' },
  { key: 'SETTINGS', label: 'Configurações & Usuários' },
]

const ACTIONS: { key: PermissionAction; label: string }[] = [
  { key: 'VIEW', label: 'Visualizar' },
  { key: 'CREATE', label: 'Criar' },
  { key: 'EDIT', label: 'Editar' },
  { key: 'DELETE', label: 'Excluir' },
  { key: 'EXPORT', label: 'Exportar' },
]

interface PermissionsMatrixProps {
  permissions: Record<PermissionModule, PermissionAction[]>
  onChange: (permissions: Record<PermissionModule, PermissionAction[]>) => void
  disabled?: boolean
}

export const PermissionsMatrix = ({
  permissions,
  onChange,
  disabled,
}: PermissionsMatrixProps) => {
  const togglePermission = (
    module: PermissionModule,
    action: PermissionAction,
  ) => {
    if (disabled) return

    const currentActions = permissions[module] || []
    const newActions = currentActions.includes(action)
      ? currentActions.filter((a) => a !== action)
      : [...currentActions, action]

    onChange({
      ...permissions,
      [module]: newActions,
    })
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Módulo</TableHead>
            {ACTIONS.map((action) => (
              <TableHead key={action.key} className="text-center">
                {action.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {MODULES.map((module) => (
            <TableRow key={module.key}>
              <TableCell className="font-medium">{module.label}</TableCell>
              {ACTIONS.map((action) => (
                <TableCell key={action.key} className="text-center">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={permissions[module.key]?.includes(action.key)}
                      onCheckedChange={() =>
                        togglePermission(module.key, action.key)
                      }
                      disabled={disabled}
                    />
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
