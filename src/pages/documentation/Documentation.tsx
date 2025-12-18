import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Calculator,
  ShieldCheck,
  Users,
  Workflow,
  FileBarChart,
  History,
} from 'lucide-react'

export default function Documentation() {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Documentação do Sistema
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Guia de referência sobre cálculos, governança e uso do portal
          estratégico.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-[#003366]">
              <FileBarChart className="h-6 w-6" />
              <CardTitle>Construtor de Relatórios</CardTitle>
            </div>
            <CardDescription>
              Guia de uso para geração de relatórios personalizados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <p>
              O novo módulo de relatórios permite criar visões customizadas
              combinando múltiplas BUs e métricas.
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Filtros de Contexto:</strong> Selecione a unidade de
                negócio desejada ou "Visão Global" para dados consolidados.
              </li>
              <li>
                <strong>Seleção de Métricas:</strong> Marque manualmente quais
                OKRs e KPIs deseja incluir no documento final.
              </li>
              <li>
                <strong>Exportação:</strong> Use o botão "Exportar" para gerar
                um arquivo <strong>PDF</strong> (ideal para apresentações) ou{' '}
                <strong>CSV</strong> (para análise de dados crua).
              </li>
            </ol>
            <div className="bg-muted p-3 rounded text-xs mt-2">
              Dica: O preview do relatório é atualizado em tempo real conforme
              você seleciona as métricas.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-[#003366]">
              <History className="h-6 w-6" />
              <CardTitle>Sistema de Auditoria</CardTitle>
            </div>
            <CardDescription>
              Rastreabilidade completa de ações e acessos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <p>
              Todas as operações críticas são registradas para garantir a
              integridade dos dados.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Registro de Acesso:</strong> Logins e acessos ao sistema
                são monitorados com timestamp.
              </li>
              <li>
                <strong>Modificações de Dados:</strong> Alterações em valores de
                KPIs, Metas ou Status de Planos geram logs com "Valor Anterior"
                e "Novo Valor".
              </li>
              <li>
                <strong>Filtros Avançados:</strong> Administradores podem
                filtrar logs por Usuário, Unidade de Negócio (BU), Tipo de Ação
                e Intervalo de Datas.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-[#003366]">
              <Calculator className="h-6 w-6" />
              <CardTitle>Cálculo de OKRs</CardTitle>
            </div>
            <CardDescription>
              Entenda como o progresso é mensurado automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <p>
              O progresso de um OKR é derivado de uma média ponderada dos KPIs
              vinculados a ele. A fórmula utilizada é:
            </p>
            <div className="bg-muted p-4 rounded-md font-mono text-xs">
              Progresso OKR = (Σ (Progresso KPI × Peso KPI)) / Σ Pesos
            </div>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Progresso do KPI:</strong> Calculado como{' '}
                <code>(Valor Atual / Meta) × 100</code>. Limitado a 100% para
                fins de cálculo do OKR, evitando distorções.
              </li>
              <li>
                <strong>Pesos:</strong> Definidos na criação do vínculo entre
                OKR e KPI. A soma dos pesos deve idealmente ser 100, mas o
                sistema normaliza automaticamente se for diferente.
              </li>
              <li>
                <strong>Status Automático:</strong>
                <ul className="list-none pl-2 mt-1 space-y-1">
                  <li>
                    <Badge className="bg-emerald-100 text-emerald-800 border-0">
                      Verde
                    </Badge>{' '}
                    Progresso ≥ 100%
                  </li>
                  <li>
                    <Badge className="bg-amber-100 text-amber-800 border-0">
                      Amarelo
                    </Badge>{' '}
                    Progresso ≥ 90%
                  </li>
                  <li>
                    <Badge className="bg-red-100 text-red-800 border-0">
                      Vermelho
                    </Badge>{' '}
                    Progresso &lt; 90%
                  </li>
                </ul>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-[#003366]">
              <ShieldCheck className="h-6 w-6" />
              <CardTitle>Governança e Auditoria</CardTitle>
            </div>
            <CardDescription>
              Regras para integridade dos dados e rastreabilidade.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <p>
              Para garantir a confiabilidade das informações estratégicas, o
              sistema implementa um controle rigoroso de alterações.
            </p>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="audit">
                <AccordionTrigger>Trilha de Auditoria</AccordionTrigger>
                <AccordionContent>
                  Todas as alterações em valores de KPIs, metas e status de
                  planos de ação são registradas imutavelmente com: Autor,
                  Data/Hora, Valor Anterior, Novo Valor e Justificativa.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="retroactive">
                <AccordionTrigger>Edições Retroativas</AccordionTrigger>
                <AccordionContent>
                  Alterações em datas passadas são permitidas apenas para perfis
                  de <strong>Gestor (GPM)</strong> e <strong>Diretor</strong>.
                  Essas ações geram alertas específicos para a governança e
                  exigem justificativa detalhada obrigatória.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-[#003366]">
              <Users className="h-6 w-6" />
              <CardTitle>Papéis e Permissões</CardTitle>
            </div>
            <CardDescription>Matriz de acesso por função.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm">Diretor Geral</h4>
                  <p className="text-xs text-muted-foreground">
                    Acesso total a todas as BUs. Pode configurar regras de
                    notificação globais e visualizar todos os dados.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Diretor de BU</h4>
                  <p className="text-xs text-muted-foreground">
                    Gestão completa de sua Unidade de Negócio. Pode criar OKRs,
                    validar KPIs e gerenciar o time da BU. Restrito aos dados da
                    sua unidade.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">GPM (Gestor)</h4>
                  <p className="text-xs text-muted-foreground">
                    Responsável pela atualização mensal dos KPIs e gestão dos
                    Planos de Ação. Pode propor novos KPIs.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Viewer</h4>
                  <p className="text-xs text-muted-foreground">
                    Acesso apenas para visualização de dashboards e relatórios.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-[#003366]">
              <Workflow className="h-6 w-6" />
              <CardTitle>Planos de Ação</CardTitle>
            </div>
            <CardDescription>
              Metodologia para correção de desvios.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-4">
            <p>
              Quando um KPI atinge o status{' '}
              <span className="text-red-600 font-bold">Crítico</span>, o sistema
              recomenda a criação imediata de um Plano de Ação.
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Identificação da Causa Raiz.</li>
              <li>Definição de tarefas com responsáveis e prazos.</li>
              <li>Monitoramento semanal até a normalização do indicador.</li>
            </ol>
            <p className="mt-2">
              Planos cancelados exigem justificativa formal registrada em
              auditoria.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
