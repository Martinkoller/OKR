export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const formatFrequency = (frequency: string): string => {
  const map: Record<string, string> = {
    MONTHLY: 'Mensal',
    BIMONTHLY: 'Bimestral',
    QUARTERLY: 'Trimestral',
    SEMESTERLY: 'Semestral',
    ANNUAL: 'Anual',
  }
  return map[frequency] || frequency
}

export const formatNumber = (value: number, unit: string = '') => {
  if (unit === 'R$') return formatCurrency(value)
  // Check if it has decimal values
  const hasDecimal = value % 1 !== 0
  return `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value)} ${unit}`
}
