import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Building,
  Settings2,
  ExternalLink,
  Library,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { BUHierarchyManager } from '@/components/settings/BUHierarchyManager'
import { TemplateManager } from '@/components/templates/TemplateManager'
import { RecycleBin } from '@/pages/admin/RecycleBin'

export const Admin = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Administração</h1>
        <p className="text-muted-foreground">
          Gerencie BUs, modelos e configurações globais do sistema.
        </p>
      </div>

      <Tabs defaultValue="bus" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bus" className="gap-2">
            <Building className="h-4 w-4" /> Unidades de Negócio
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <Library className="h-4 w-4" /> Modelos
          </TabsTrigger>
          <TabsTrigger
            value="recycle-bin"
            className="gap-2 text-red-600 data-[state=active]:text-red-700"
          >
            <Trash2 className="h-4 w-4" /> Lixeira
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Settings2 className="h-4 w-4" /> Parâmetros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bus">
          <BUHierarchyManager />
        </TabsContent>

        <TabsContent value="templates">
          <TemplateManager />
        </TabsContent>

        <TabsContent value="recycle-bin">
          <RecycleBin />
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
