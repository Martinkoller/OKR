import { useState, useEffect } from 'react'
import { useUserStore } from '@/stores/useUserStore'
import { useDataStore } from '@/stores/useDataStore'
import { usePermissions } from '@/hooks/usePermissions'
import { Button } from '@/components/ui/button'
import { Download, Printer, FileSpreadsheet, Activity } from 'lucide-react'
import { ReportBuilderFilters } from '@/components/reports/ReportBuilderFilters'
import { ReportBuilderPreview } from '@/components/reports/ReportBuilderPreview'
import { AuditAnalysisReport } from '@/components/reports/AuditAnalysisReport'
import { generateReportCSV, printReport } from '@/lib/report-utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function CustomReportBuilder() {
  const { bus, selectedBUIds, isGlobalView, currentUser } = useUserStore()
  const { okrs, kpis, addAuditEntry } = useDataStore()
  const { canExport } = usePermissions()
  const { toast } = useToast()

  const [selectedOKRIds, setSelectedOKRIds] = useState<string[]>([])
  const [selectedKPIIds, setSelectedKPIIds] = useState<string[]>([])

  const isGlobal = isGlobalView()

  // Filter Data based on BU Selection
  const filteredOKRs = okrs.filter(
    (o) => isGlobal || selectedBUIds.includes(o.buId),
  )
  const filteredKPIs = kpis.filter(
    (k) => isGlobal || selectedBUIds.includes(k.buId),
  )

  // Report Data (Intersection of BU filter and User Selection)
  const reportOKRs = filteredOKRs.filter((o) => selectedOKRIds.includes(o.id))
  const reportKPIs = filteredKPIs.filter((k) => selectedKPIIds.includes(k.id))

  // Get current context name
  const getContextName = () => {
    if (isGlobal) return 'Visão Global Consolidada'
    if (selectedBUIds.length === 1) {
      return (
        bus.find((b) => b.id === selectedBUIds[0])?.name ||
        'Unidade Selecionada'
      )
    }
    return `${selectedBUIds.length} Unidades Selecionadas`
  }

  const handleExportPDF = () => {
    printReport()
    if (currentUser) {
      addAuditEntry({
        entityType: 'REPORT',
        action: 'EXPORT',
        reason: 'Exportação PDF de Relatório Customizado',
        userId: currentUser.id,
      })
    }
  }

  const handleExportCSV = () => {
    generateReportCSV(reportOKRs, reportKPIs, getContextName())
    if (currentUser) {
      addAuditEntry({
        entityType: 'REPORT',
        action: 'EXPORT',
        reason: 'Exportação CSV de Relatório Customizado',
        userId: currentUser.id,
      })
    }
    toast({
      title: 'Download Iniciado',
      description: 'O arquivo CSV foi gerado com sucesso.',
    })
  }

  // Pre-select some data initially
  useEffect(() => {
    if (selectedOKRIds.length === 0 && filteredOKRs.length > 0) {
      setSelectedOKRIds(filteredOKRs.slice(0, 3).map((o) => o.id))
    }
    if (selectedKPIIds.length === 0 && filteredKPIs.length > 0) {
      setSelectedKPIIds(filteredKPIs.slice(0, 3).map((k) => k.id))
    }
  }, [selectedBUIds])

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Construtor de Relatórios
          </h1>
          <p className="text-muted-foreground mt-1">
            Gere documentos customizados e analise a integridade dos dados.
          </p>
        </div>
        {canExport('REPORT') && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <Download className="h-4 w-4" /> Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPDF}>
                <Printer className="mr-2 h-4 w-4" /> Imprimir / PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Arquivo CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="print:hidden">
          <TabsTrigger value="performance">Relatório de Desempenho</TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Activity className="h-4 w-4" /> Análise de Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6 print:hidden">
              <ReportBuilderFilters
                bus={bus}
                okrs={filteredOKRs}
                kpis={filteredKPIs}
                selectedOKRIds={selectedOKRIds}
                setSelectedOKRIds={setSelectedOKRIds}
                selectedKPIIds={selectedKPIIds}
                setSelectedKPIIds={setSelectedKPIIds}
              />
            </div>

            <div className="lg:col-span-2">
              <ReportBuilderPreview
                okrs={reportOKRs}
                kpis={reportKPIs}
                selectedBUName={getContextName()}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <AuditAnalysisReport />
        </TabsContent>
      </Tabs>

      <div className="hidden print:block text-center text-xs text-muted-foreground mt-8 pt-4 border-t">
        <p>StratManager by MarteckConsultoria &copy; 2024</p>
      </div>
    </div>
  )
}
