import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { User, Role } from '@/types'
import { useUserStore } from '@/stores/useUserStore'
import { useEffect } from 'react'

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('Insira um e-mail válido.'),
  role: z.enum(
    ['DIRECTOR_GENERAL', 'DIRECTOR_BU', 'GPM', 'PM', 'VIEWER'] as const,
    {
      required_error: 'Selecione um perfil de acesso.',
    },
  ),
  active: z.boolean().default(true),
  buIds: z.array(z.string()).default([]),
  password: z
    .string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres.')
    .optional()
    .or(z.literal('')),
})

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userToEdit?: User
  onSubmit: (data: any) => void
}

export const UserFormDialog = ({
  open,
  onOpenChange,
  userToEdit,
  onSubmit,
}: UserFormDialogProps) => {
  const { bus } = useUserStore()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'VIEWER',
      active: true,
      buIds: [],
      password: '',
    },
  })

  useEffect(() => {
    if (userToEdit) {
      form.reset({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role,
        active: userToEdit.active,
        buIds: userToEdit.buIds,
        password: '', // Don't fill password on edit
      })
    } else {
      form.reset({
        name: '',
        email: '',
        role: 'VIEWER',
        active: true,
        buIds: [],
        password: '',
      })
    }
  }, [userToEdit, form, open])

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {userToEdit ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
          <DialogDescription>
            {userToEdit
              ? 'Atualize os dados de acesso e permissões.'
              : 'Preencha os campos para criar um novo usuário.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail Corporativo</FormLabel>
                  <FormControl>
                    <Input placeholder="joao@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil de Acesso</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DIRECTOR_GENERAL">
                          Administrador (Diretor Geral)
                        </SelectItem>
                        <SelectItem value="DIRECTOR_BU">
                          Diretor de BU
                        </SelectItem>
                        <SelectItem value="GPM">Gestor (GPM)</SelectItem>
                        <SelectItem value="PM">Gerente de Projeto</SelectItem>
                        <SelectItem value="VIEWER">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Define o nível de permissão no sistema.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {userToEdit ? 'Nova Senha (Opcional)' : 'Senha'}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormDescription>Mínimo de 6 caracteres.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Usuário Ativo</FormLabel>
                    <FormDescription>
                      Desmarque para bloquear o acesso temporariamente.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="buIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">
                      Unidades de Negócio (BUs)
                    </FormLabel>
                    <FormDescription>
                      Selecione as unidades que este usuário pode acessar.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border rounded-md p-4">
                    {bus.map((bu) => (
                      <FormField
                        key={bu.id}
                        control={form.control}
                        name="buIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={bu.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(bu.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, bu.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== bu.id,
                                          ),
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {bu.name}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar Usuário</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
