import { OKR, KPI } from '@/types'
import {
  calculateOKRProgressForYear,
  getKPIValueForYear,
  downloadCSV,
} from '@/lib/kpi-utils'
import { format } from 'date-fns'

export const generateReportCSV = (
  okrs: OKR[],
  kpis: KPI[],
  selectedBUName: string,
) => {
  const csvData: any[] = []
  const currentYear = new Date().getFullYear()

  // Header Section
  csvData.push({
    Type: 'METADATA',
    Name: 'Relatório Gerado em',
    Value: format(new Date(), 'dd/MM/yyyy HH:mm'),
    Context: selectedBUName,
  })

  // OKRs
  okrs.forEach((okr) => {
    csvData.push({
      Type: 'OKR',
      ID: okr.id,
      Name: okr.title,
      Scope: okr.scope,
      Weight: okr.weight,
      Owner: okr.ownerId,
      Status: okr.status,
      Progress: `${okr.progress}%`,
    })
  })

  // KPIs
  kpis.forEach((kpi) => {
    csvData.push({
      Type: 'KPI',
      ID: kpi.id,
      Name: kpi.name,
      Frequency: kpi.frequency,
      Unit: kpi.unit,
      Goal: kpi.goal,
      CurrentValue: kpi.currentValue,
      Status: kpi.status,
    })
  })

  downloadCSV(
    csvData,
    `relatorio_estrategico_${format(new Date(), 'yyyyMMdd')}.csv`,
  )
}

export const printReport = () => {
  window.print()
}
