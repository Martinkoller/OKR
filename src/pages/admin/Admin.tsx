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
import { Plus, Building, Settings2, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Admin = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Administração</h1>
        <p className="text-muted-foreground">
          Gerencie BUs e configurações globais do sistema.
        </p>
      </div>

      <Tabs defaultValue="bus" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bus" className="gap-2">
            <Building className="h-4 w-4" /> Unidades de Negócio
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Settings2 className="h-4 w-4" /> Parâmetros
          </TabsTrigger>
        </TabsList>

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
              <div className="pt-4 border-t mt-4">
                <h3 className="font-medium mb-2">Outras Configurações</h3>
                <Button
                  variant="outline"
                  asChild
                  className="w-full justify-start"
                >
                  <Link to="/settings/users">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Gerenciar Usuários e Permissões
                  </Link>
                </Button>
              </div>
              <Button className="mt-4">Salvar Alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
