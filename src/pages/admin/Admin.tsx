import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Users, Building, Settings2 } from 'lucide-react'

export const Admin = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Administração</h1>
        <p className="text-muted-foreground">
          Gerencie usuários, BUs e configurações do sistema.
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="bus" className="gap-2">
            <Building className="h-4 w-4" /> Unidades de Negócio
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Settings2 className="h-4 w-4" /> Parâmetros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestão de Usuários</CardTitle>
                <CardDescription>
                  Adicione ou remova acesso ao portal.
                </CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Novo Usuário
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <Input placeholder="Buscar usuário..." className="max-w-sm" />
              </div>
              <div className="border rounded-md p-8 text-center text-muted-foreground">
                Tabela de usuários mockada (não funcional nesta demo).
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bus">
          <Card>
            <CardHeader>
              <CardTitle>Estrutura Organizacional</CardTitle>
              <CardDescription>
                Defina as Unidades de Negócio (BUs).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {['Varejo', 'RH', 'ERP', 'Logística'].map((bu) => (
                  <div
                    key={bu}
                    className="p-4 border rounded-lg flex justify-between items-center"
                  >
                    <span className="font-medium">{bu}</span>
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="border-dashed h-full">
                  <Plus className="mr-2 h-4 w-4" /> Adicionar BU
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Parâmetros Globais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label>Ano Estratégico Atual</Label>
                <Input defaultValue="2024" />
              </div>
              <div className="space-y-2">
                <Label>E-mail para Notificações de Alerta</Label>
                <Input defaultValue="alertas@zucchetti.com.br" />
              </div>
              <Button>Salvar Alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
