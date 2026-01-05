import { useState } from 'react'
import { useUserStore } from '@/stores/useUserStore'
import { useDataStore } from '@/stores/useDataStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Database,
  Save,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function BIIntegration() {
  const { biConfig, updateBIConfig, currentUser } = useUserStore()
  const { addAuditEntry } = useDataStore()
  const { toast } = useToast()

  const [enabled, setEnabled] = useState(biConfig.enabled)
  const [workspaceId, setWorkspaceId] = useState(biConfig.workspaceId || '')
  const [reportId, setReportId] = useState(biConfig.reportId || '')
  const [embedUrl, setEmbedUrl] = useState(biConfig.embedUrl || '')

  const handleSave = () => {
    updateBIConfig({
      provider: 'POWER_BI',
      enabled,
      workspaceId,
      reportId,
      embedUrl,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.id || 'system',
    })

    if (currentUser) {
      addAuditEntry({
        entityType: 'INTEGRATION',
        action: 'UPDATE',
        reason: 'Atualização de configuração do Power BI',
        userId: currentUser.id,
      })
    }

    toast({
      title: 'Configuração Salva',
      description: 'As definições de integração BI foram atualizadas.',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Integração Business Intelligence
        </h1>
        <p className="text-muted-foreground">
          Conecte o StratManager aos seus dashboards corporativos do Power BI
          para análise avançada de dados.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-md">
                <Database className="h-6 w-6 text-yellow-700" />
              </div>
              <CardTitle>Configuração Power BI</CardTitle>
            </div>
            <CardDescription>
              Parâmetros de conexão para embed de relatórios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border p-3 rounded-md bg-muted/20">
              <div className="space-y-0.5">
                <Label className="text-base">Habilitar Integração</Label>
                <p className="text-xs text-muted-foreground">
                  Permite a visualização de relatórios externos no portal.
                </p>
              </div>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>

            <div
              className={cn(
                'space-y-4',
                !enabled && 'opacity-50 pointer-events-none',
              )}
            >
              <div className="space-y-2">
                <Label htmlFor="workspace">Workspace ID</Label>
                <Input
                  id="workspace"
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report">Report ID</Label>
                <Input
                  id="report"
                  value={reportId}
                  onChange={(e) => setReportId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Embed URL (Secure)</Label>
                <Input
                  id="url"
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                  placeholder="https://app.powerbi.com/reportEmbed?..."
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between border-t p-4 bg-muted/10">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              {biConfig.updatedAt && (
                <>
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Atualizado em:{' '}
                  {new Date(biConfig.updatedAt).toLocaleDateString()}
                </>
              )}
            </div>
            <Button
              onClick={handleSave}
              disabled={!enabled && !biConfig.enabled}
            >
              <Save className="mr-2 h-4 w-4" /> Salvar Alterações
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Preview do Relatório</CardTitle>
              <CardDescription>
                Visualização de teste com as configurações atuais.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px] p-0 overflow-hidden relative bg-gray-100">
              {enabled && embedUrl ? (
                <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-white border-t border-b">
                  {/* Mock Iframe for security/demo reasons */}
                  <div className="text-center p-6">
                    <img
                      src="https://img.usecurling.com/i?q=chart&color=blue"
                      alt="Power BI Placeholder"
                      className="mx-auto h-24 w-24 opacity-50 mb-4"
                    />
                    <h3 className="font-semibold text-gray-900">
                      Power BI Embedded
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      O relatório seria carregado aqui com a URL fornecida.
                    </p>
                    <a
                      href={embedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center justify-center gap-1"
                    >
                      Abrir em nova aba <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                  <ShieldAlert className="h-10 w-10 mb-2 opacity-20" />
                  <p>Integração desabilitada ou URL não configurada.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground mt-8 pt-4 border-t">
        <p>StratManager by MarteckConsultoria &copy; 2024</p>
      </div>
    </div>
  )
}
