import {
  BU,
  User,
  KPI,
  OKR,
  ActionPlan,
  AuditEntry,
  RoleDefinition,
  Group,
  Template,
  KPIHistoryEntry,
} from '@/types'
import { subMonths, format } from 'date-fns'

// Helper to generate history
const generateHistory = (
  months: number,
  baseValue: number,
  trend: 'UP' | 'DOWN' | 'STABLE',
  userId: string,
): KPIHistoryEntry[] => {
  const history: KPIHistoryEntry[] = []
  const today = new Date()
  let currentValue = baseValue

  for (let i = months; i >= 0; i--) {
    const date = subMonths(today, i)
    // Add some randomness
    const variance = Math.random() * (baseValue * 0.1)
    if (trend === 'UP') currentValue += variance * 0.5
    else if (trend === 'DOWN') currentValue -= variance * 0.5
    else currentValue += variance * (Math.random() > 0.5 ? 1 : -1)

    history.push({
      date: date.toISOString(),
      value: Math.max(0, Math.round(currentValue)),
      updatedByUserId: userId,
      timestamp: date.toISOString(),
      comment: i === 0 ? 'Fechamento atual' : 'Fechamento mensal',
    })
  }
  return history
}

export const MOCK_BUS: BU[] = [
  {
    id: 'bu-5',
    name: 'Corporativo (Holding)',
    description: 'Administração central e serviços compartilhados.',
    slug: 'corp',
    roleIds: [],
  },
  {
    id: 'bu-1',
    name: 'Varejo',
    description: 'Soluções para o varejo físico e digital.',
    slug: 'varejo',
    parentId: 'bu-5',
    roleIds: [],
  },
  {
    id: 'bu-2',
    name: 'Recursos Humanos',
    description: 'Gestão de talentos e cultura organizacional.',
    slug: 'rh',
    parentId: 'bu-5',
    roleIds: [],
  },
  {
    id: 'bu-3',
    name: 'ERP',
    description: 'Sistemas de gestão empresarial integrados.',
    slug: 'erp',
    parentId: 'bu-5',
    roleIds: [],
  },
  {
    id: 'bu-4',
    name: 'Fintech',
    description: 'Serviços financeiros e meios de pagamento.',
    slug: 'fintech',
    parentId: 'bu-5',
    roleIds: [],
  },
  {
    id: 'bu-6',
    name: 'Varejo Sul',
    description: 'Operações de varejo na região Sul.',
    slug: 'varejo-sul',
    parentId: 'bu-1',
    roleIds: [],
  },
]

export const MOCK_ROLES: RoleDefinition[] = [
  {
    id: 'DIRECTOR_GENERAL',
    name: 'Diretor Geral (Admin)',
    description: 'Acesso completo a todos os módulos e configurações.',
    isSystem: true,
    permissions: {
      OKR: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT'],
      KPI: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT'],
      REPORT: ['VIEW', 'EXPORT'],
      SETTINGS: ['VIEW', 'CREATE', 'EDIT', 'DELETE'],
    },
  },
  {
    id: 'DIRECTOR_BU',
    name: 'Diretor de BU',
    description: 'Gestão completa da Unidade de Negócio.',
    isSystem: true,
    permissions: {
      OKR: ['VIEW', 'CREATE', 'EDIT', 'EXPORT'],
      KPI: ['VIEW', 'CREATE', 'EDIT', 'EXPORT'],
      REPORT: ['VIEW', 'EXPORT'],
      SETTINGS: [],
    },
  },
  {
    id: 'GPM',
    name: 'Gestor (GPM)',
    description: 'Gestão operacional de KPIs e Planos de Ação.',
    isSystem: true,
    permissions: {
      OKR: ['VIEW', 'EDIT'],
      KPI: ['VIEW', 'CREATE', 'EDIT'],
      REPORT: ['VIEW'],
      SETTINGS: [],
    },
  },
  {
    id: 'PM',
    name: 'Gerente de Projeto',
    description: 'Acesso a visualização e edição limitada.',
    isSystem: true,
    permissions: {
      OKR: ['VIEW'],
      KPI: ['VIEW', 'EDIT'],
      REPORT: ['VIEW'],
      SETTINGS: [],
    },
  },
  {
    id: 'VIEWER',
    name: 'Visualizador',
    description: 'Apenas leitura.',
    isSystem: true,
    permissions: {
      OKR: ['VIEW'],
      KPI: ['VIEW'],
      REPORT: ['VIEW'],
      SETTINGS: [],
    },
  },
]

export const MOCK_GROUPS: Group[] = [
  {
    id: 'grp-1',
    name: 'Auditores Externos',
    description: 'Grupo para auditores com permissão de visualização global.',
    roleIds: ['VIEWER'],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'grp-2',
    name: 'Comitê Estratégico',
    description: 'Membros do board com acesso a relatórios avançados.',
    roleIds: ['DIRECTOR_BU'],
    createdAt: '2024-02-15T14:30:00Z',
    updatedAt: '2024-02-15T14:30:00Z',
  },
]

export const MOCK_USERS: User[] = [
  {
    id: 'u-1',
    name: 'Carlos CEO',
    email: 'carlos@zucchetti.com',
    role: 'DIRECTOR_GENERAL',
    buIds: ['bu-5'],
    groupIds: ['grp-2'],
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=male&seed=99',
    active: true,
    password: '123',
  },
  {
    id: 'u-2',
    name: 'Ana Varejo',
    email: 'ana@zucchetti.com',
    role: 'DIRECTOR_BU',
    buIds: ['bu-1'],
    groupIds: [],
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=female&seed=12',
    active: true,
    password: '123',
  },
  {
    id: 'u-3',
    name: 'Roberto RH',
    email: 'roberto@zucchetti.com',
    role: 'DIRECTOR_BU',
    buIds: ['bu-2'],
    groupIds: [],
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=male&seed=45',
    active: true,
    password: '123',
  },
  {
    id: 'u-4',
    name: 'GPM Silva',
    email: 'silva@zucchetti.com',
    role: 'GPM',
    buIds: ['bu-1', 'bu-3'],
    groupIds: [],
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=male&seed=33',
    active: true,
    password: '123',
  },
  {
    id: 'u-5',
    name: 'Paula PM',
    email: 'paula@zucchetti.com',
    role: 'PM',
    buIds: ['bu-4'],
    groupIds: [],
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=female&seed=21',
    active: false,
    password: '123',
  },
  {
    id: 'u-6',
    name: 'Vicente Viewer',
    email: 'vicente@zucchetti.com',
    role: 'VIEWER',
    buIds: ['bu-1'],
    groupIds: ['grp-1'],
    avatarUrl: 'https://img.usecurling.com/ppl/medium?gender=male&seed=10',
    active: true,
    password: '123',
  },
]

export const MOCK_KPIS: KPI[] = [
  {
    id: 'kpi-1',
    name: 'MRR - Varejo',
    description: 'Monthly Recurring Revenue do Varejo',
    buId: 'bu-1',
    ownerId: 'u-2',
    frequency: 'MONTHLY',
    type: 'QUANT',
    unit: 'R$',
    goal: 1500000,
    weight: 40,
    currentValue: 1450000,
    status: 'YELLOW',
    lastUpdated: '2024-06-01T10:00:00Z',
    history: generateHistory(24, 1200000, 'UP', 'u-2'),
  },
  {
    id: 'kpi-2',
    name: 'NPS Varejo',
    description: 'Net Promoter Score',
    buId: 'bu-1',
    ownerId: 'u-3',
    frequency: 'MONTHLY',
    type: 'QUAL',
    unit: 'pts',
    goal: 60,
    weight: 30,
    currentValue: 65,
    status: 'GREEN',
    lastUpdated: '2024-06-01T10:00:00Z',
    history: generateHistory(24, 50, 'UP', 'u-3'),
  },
  {
    id: 'kpi-3',
    name: 'Tempo Médio de Contratação (RH)',
    description: 'Dias corridos desde a abertura da vaga',
    buId: 'bu-2',
    ownerId: 'u-3',
    frequency: 'MONTHLY',
    type: 'QUANT',
    unit: 'dias',
    goal: 30,
    weight: 50,
    currentValue: 45,
    status: 'RED',
    lastUpdated: '2024-06-15T10:00:00Z',
    history: generateHistory(24, 30, 'DOWN', 'u-3'),
  },
]

export const MOCK_OKRS: OKR[] = [
  {
    id: 'okr-1',
    title: 'Dominar Mercado SMB no Varejo',
    description: 'Expandir market share agressivamente',
    buId: 'bu-1',
    scope: 'ANNUAL',
    startYear: 2024,
    endYear: 2024,
    weight: 100,
    ownerId: 'u-2',
    kpiIds: ['kpi-1', 'kpi-2'],
    progress: 88,
    status: 'YELLOW',
  },
  {
    id: 'okr-2',
    title: 'Excelência em Talent Acquisition',
    description: 'Melhorar eficiência do time de RH',
    buId: 'bu-2',
    scope: 'ANNUAL',
    startYear: 2024,
    endYear: 2024,
    weight: 80,
    ownerId: 'u-3',
    kpiIds: ['kpi-3'],
    progress: 50,
    status: 'RED',
  },
  {
    id: 'okr-3',
    title: 'Transformação Digital Plurianual',
    description: 'Migração completa de sistemas legados e adoção de IA',
    buId: 'bu-5',
    scope: 'MULTI_YEAR',
    startYear: 2024,
    endYear: 2026,
    weight: 100,
    ownerId: 'u-1',
    kpiIds: ['kpi-1'],
    progress: 60,
    status: 'GREEN',
  },
]

export const MOCK_ACTION_PLANS: ActionPlan[] = [
  {
    id: 'ap-1',
    title: 'Força Tarefa de Recrutamento',
    description: 'Contratação de consultoria externa para vagas críticas',
    entityId: 'kpi-3',
    entityType: 'KPI',
    status: 'IN_PROGRESS',
    dueDate: '2024-08-30',
    ownerId: 'u-3',
    tasks: [
      {
        id: 't-1',
        description: 'Selecionar Consultoria',
        ownerId: 'u-3',
        deadline: '2024-07-01',
        status: 'DONE',
        attachments: [],
      },
      {
        id: 't-2',
        description: 'Assinar Contrato',
        ownerId: 'u-3',
        deadline: '2024-07-15',
        status: 'PENDING',
        attachments: [],
      },
    ],
    createdAt: '2024-06-20T10:00:00Z',
    updatedAt: '2024-06-21T10:00:00Z',
  },
]

export const MOCK_AUDIT_LOGS: AuditEntry[] = [
  {
    id: 'log-1',
    entityId: 'kpi-3',
    entityType: 'KPI',
    action: 'UPDATE',
    field: 'currentValue',
    oldValue: 35,
    newValue: 45,
    reason: 'Aumento na demanda de vagas tech',
    userId: 'u-3',
    timestamp: '2024-06-15T10:00:00Z',
  },
  {
    id: 'log-2',
    entityId: 'kpi-1',
    entityType: 'KPI',
    action: 'UPDATE',
    field: 'currentValue',
    oldValue: 1400000,
    newValue: 1450000,
    reason: 'Fechamento mensal Junho',
    userId: 'u-2',
    timestamp: '2024-06-01T10:00:00Z',
  },
  {
    id: 'log-3',
    entityType: 'SYSTEM',
    action: 'ACCESS',
    reason: 'Login realizado com sucesso',
    userId: 'u-1',
    timestamp: new Date().toISOString(),
    details: 'IP: 192.168.1.1',
  },
]

export const MOCK_TEMPLATES: Template[] = [
  {
    id: 'tpl-1',
    type: 'OKR',
    title: 'Crescimento de Receita Recorrente',
    description:
      'Foco total em aumentar o faturamento recorrente através de vendas e redução de churn.',
    scope: 'ANNUAL',
    suggestedMetrics: [
      'Aumentar MRR em 20%',
      'Reduzir Churn Rate para < 1%',
      'Aumentar ticket médio (ARPU)',
    ],
  },
  {
    id: 'tpl-2',
    type: 'OKR',
    title: 'Excelência Operacional & Qualidade',
    description:
      'Melhoria contínua dos processos internos para garantir satisfação do cliente.',
    scope: 'ANNUAL',
    suggestedMetrics: [
      'Manter NPS acima de 70',
      'Reduzir SLA de atendimento em 50%',
      'Certificação ISO 9001',
    ],
  },
  {
    id: 'tpl-3',
    type: 'KPI',
    title: 'MRR (Monthly Recurring Revenue)',
    description:
      'Receita recorrente mensal. Principal indicador para empresas SaaS.',
    frequency: 'MONTHLY',
    kpiType: 'QUANT',
    unit: 'R$',
    suggestedGoal: 100000,
    suggestedMetrics: ['Monitorar mensalmente', 'Focar em novos contratos'],
  },
  {
    id: 'tpl-4',
    type: 'KPI',
    title: 'NPS (Net Promoter Score)',
    description: 'Índice de satisfação e lealdade do cliente.',
    frequency: 'QUARTERLY',
    kpiType: 'QUAL',
    unit: 'pts',
    suggestedGoal: 75,
    suggestedMetrics: ['Pesquisa trimestral', 'Tratar detratores'],
  },
  // Expanded Models
  {
    id: 'tpl-5',
    type: 'KPI',
    title: 'Churn Rate (Taxa de Cancelamento)',
    description: 'Percentual de clientes que cancelaram o serviço.',
    frequency: 'MONTHLY',
    kpiType: 'QUANT',
    unit: '%',
    suggestedGoal: 1.0,
    suggestedMetrics: ['Cálculo: (Cancelamentos / Base Ativa) * 100'],
  },
  {
    id: 'tpl-6',
    type: 'KPI',
    title: 'EBITDA (Margem Operacional)',
    description: 'Lucros antes de juros, impostos, depreciação e amortização.',
    frequency: 'MONTHLY',
    kpiType: 'QUANT',
    unit: 'R$',
    suggestedGoal: 500000,
    suggestedMetrics: ['Acompanhamento financeiro rigoroso'],
  },
  {
    id: 'tpl-7',
    type: 'KPI',
    title: 'CAC (Custo de Aquisição de Cliente)',
    description: 'Custo médio para conquistar um novo cliente.',
    frequency: 'MONTHLY',
    kpiType: 'QUANT',
    unit: 'R$',
    suggestedGoal: 500,
    suggestedMetrics: ['Incluir custos de marketing e vendas'],
  },
]
