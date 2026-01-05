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
  Target,
  BarChart3,
  HelpCircle,
  LayoutDashboard,
  Rocket,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Documentation() {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Manual do Sistema (StratManager)
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Guia completo de uso, conceitos estratégicos e governança da
          plataforma by MarteckConsultoria.
        </p>
      </div>

      <Tabs defaultValue="onboarding" className="space-y-6">
        <TabsList className="w-full justify-start h-auto flex-wrap p-2 gap-2">
          <TabsTrigger value="onboarding" className="gap-2">
            <Rocket className="h-4 w-4" /> Primeiros Passos
          </TabsTrigger>
          <TabsTrigger value="modules" className="gap-2">
            <LayoutDashboard className="h-4 w-4" /> Módulos Principais
          </TabsTrigger>
          <TabsTrigger value="okr" className="gap-2">
            <Target className="h-4 w-4" /> Gestão de OKRs
          </TabsTrigger>
          <TabsTrigger value="kpi" className="gap-2">
            <BarChart3 className="h-4 w-4" /> KPIs e Métricas
          </TabsTrigger>
          <TabsTrigger value="action-plans" className="gap-2">
            <Workflow className="h-4 w-4" /> Planos de Ação
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <History className="h-4 w-4" /> Auditoria & Governança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="onboarding" className="space-y-6">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Bem-vindo ao StratManager</CardTitle>
              <CardDescription>
                Guia rápido para começar a utilizar a plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">1. Navegação Inicial</h3>
                <p className="text-muted-foreground text-sm">
                  Ao entrar, você verá o <strong>Dashboard</strong>, que resume
                  o progresso geral. Utilize a barra lateral esquerda para
                  navegar entre os módulos.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  2. Configurando seu Perfil
                </h3>
                <p className="text-muted-foreground text-sm">
                  Verifique se você tem acesso às Unidades de Negócio (BUs)
                  corretas. Seu nome completo será exibido em todas as ações que
                  você realizar no sistema (criação de planos, atualização de
                  KPIs, etc).
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  3. Fluxo de Trabalho Básico
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>
                    <strong>Monitore:</strong> Acompanhe os gráficos de evolução
                    no Dashboard.
                  </li>
                  <li>
                    <strong>Analise:</strong> Se um KPI estiver vermelho, clique
                    para ver detalhes.
                  </li>
                  <li>
                    <strong>Aja:</strong> Crie um Plano de Ação para corrigir
                    desvios.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visão Geral do Sistema</CardTitle>
                <CardDescription>Entendendo a estrutura</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-600">
                <p>
                  O StratManager é dividido em módulos interconectados para
                  garantir o alinhamento estratégico da Zucchetti Brasil:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Dashboard:</strong> Visão consolidada do progresso
                    da empresa e das unidades de negócio (BUs).
                  </li>
                  <li>
                    <strong>OKRs:</strong> Objetivos de alto nível (Anuais ou
                    Plurianuais).
                  </li>
                  <li>
                    <strong>KPIs:</strong> Indicadores mensais que alimentam os
                    OKRs.
                  </li>
                  <li>
                    <strong>Planos de Ação:</strong> Iniciativas táticas para
                    corrigir desvios ou impulsionar resultados.
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Níveis de Acesso</CardTitle>
                <CardDescription>Papéis e Responsabilidades</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm">Diretor Geral</h4>
                      <p className="text-xs text-muted-foreground">
                        Acesso total. Visualiza todas as BUs, cria OKRs
                        estratégicos globais e gerencia usuários.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Diretor de BU</h4>
                      <p className="text-xs text-muted-foreground">
                        Gestão da sua Unidade. Cria OKRs da unidade, valida KPIs
                        e aprova planos de ação.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">GPM (Gestor)</h4>
                      <p className="text-xs text-muted-foreground">
                        Operacional. Atualiza mensalmente os KPIs, cria Planos
                        de Ação e reporta resultados.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Viewer</h4>
                      <p className="text-xs text-muted-foreground">
                        Apenas leitura. Acesso a relatórios e dashboards.
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="okr" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Objetivos (OKRs)</CardTitle>
              <CardDescription>
                Como definir e acompanhar metas estratégicas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="create">
                  <AccordionTrigger>Como criar um novo OKR?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>
                        Acesse o menu <strong>Meus OKRs</strong>.
                      </li>
                      <li>
                        Clique no botão <strong>Novo OKR</strong> no canto
                        superior direito.
                      </li>
                      <li>
                        Preencha o Título, Descrição, Unidade de Negócio e o
                        período (Anual ou Plurianual).
                      </li>
                      <li>
                        Defina o <strong>Peso Estratégico</strong> (1-100) para
                        priorização.
                      </li>
                      <li>
                        Vincule os KPIs existentes que compõem este resultado.
                        Se o KPI não existir, você poderá criá-lo depois.
                      </li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="calc">
                  <AccordionTrigger>
                    Como o progresso é calculado?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <p className="mb-2">
                      O progresso do OKR é a média ponderada dos KPIs vinculados
                      a ele.
                    </p>
                    <div className="bg-muted p-3 rounded font-mono text-xs mb-2">
                      Progresso OKR = (Σ (Progresso KPI × Peso KPI)) / Σ Pesos
                    </div>
                    <p>
                      Exemplo: Se você tem dois KPIs com peso 50 cada, e um está
                      100% concluído e o outro 0%, seu OKR estará em 50%.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpi" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Indicadores (KPIs)</CardTitle>
              <CardDescription>
                Monitoramento mensal e atualização de valores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="update">
                  <AccordionTrigger>
                    Atualização Mensal (Fechamento)
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <p className="mb-2">
                      Todo início de mês, os gestores devem lançar os resultados
                      do mês anterior.
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>
                        Acesse o KPI desejado na lista ou dentro de um OKR.
                      </li>
                      <li>
                        Use o painel <strong>Atualizar Medição</strong>.
                      </li>
                      <li>
                        Insira a <strong>Data de Referência</strong> (ex: último
                        dia do mês passado).
                      </li>
                      <li>
                        Insira o <strong>Novo Valor</strong> acumulado.
                      </li>
                      <li>
                        Se o status for Amarelo ou Vermelho, é{' '}
                        <strong>obrigatório</strong> inserir uma justificativa.
                      </li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="status">
                  <AccordionTrigger>Regras de Cores (Status)</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Badge className="bg-emerald-100 text-emerald-800 border-0">
                          Verde
                        </Badge>
                        <span>Atingiu 100% ou mais da meta.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge className="bg-amber-100 text-amber-800 border-0">
                          Amarelo
                        </Badge>
                        <span>Entre 90% e 99% da meta. Requer atenção.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800 border-0">
                          Vermelho
                        </Badge>
                        <span>
                          Abaixo de 90%. Crítico, exige Plano de Ação.
                        </span>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="action-plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Planos de Ação</CardTitle>
              <CardDescription>
                Gestão de iniciativas para correção e melhoria.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="create-plan">
                  <AccordionTrigger>Criando um Plano de Ação</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <p className="mb-2">
                      Planos de ação podem ser criados a partir da tela de um
                      KPI, de um OKR, ou do menu "Planos de Ação".
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Clique em "Novo Plano".</li>
                      <li>Defina um título claro e uma data limite (prazo).</li>
                      <li>
                        Selecione a <strong>Entidade Principal</strong> (o KPI
                        ou OKR que originou a necessidade deste plano).
                      </li>
                      <li>
                        (Opcional) Use a seção{' '}
                        <strong>Conexões Estratégicas</strong> para vincular
                        outros KPIs ou OKRs que também serão impactados por este
                        plano.
                      </li>
                      <li>
                        Adicione tarefas específicas com responsáveis e prazos
                        individuais.
                      </li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="linkage">
                  <AccordionTrigger>Associação Múltipla</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    <p>
                      Um plano de ação muitas vezes impacta mais de um
                      indicador. O sistema permite vincular um plano a múltiplos
                      OKRs e KPIs simultaneamente para garantir visibilidade
                      cruzada.
                    </p>
                    <p className="mt-2">
                      No detalhe do plano, você verá tags indicando todos os
                      itens vinculados.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Auditoria e Rastreabilidade</CardTitle>
              <CardDescription>
                Garantia da integridade da informação.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-4">
              <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">
                    Logs Imutáveis
                  </h4>
                  <p>
                    Toda alteração de valor (meta ou realizado) gera um registro
                    automático contendo: Quem alterou (Nome do Usuário), Data e
                    Hora, Valor Antigo, Novo Valor e Justificativa.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border p-4 rounded-md">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <History className="h-4 w-4" /> Histórico de Versões
                  </h4>
                  <p>
                    Nos detalhes de KPIs e OKRs, utilize o botão "Comparar
                    Versões" para visualizar lado a lado o que mudou entre duas
                    datas específicas.
                  </p>
                </div>
                <div className="border p-4 rounded-md">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileBarChart className="h-4 w-4" /> Relatórios de Auditoria
                  </h4>
                  <p>
                    Administradores podem exportar o log completo de atividades
                    em CSV para compliance externo através do menu
                    Configurações.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
