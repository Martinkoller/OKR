import { OKR, KPI } from '@/types'
import { calculateAnnualTrend } from '@/lib/dashboard-utils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { CalendarRange } from 'lucide-react'

interface AnnualViewProps {
  okrs: OKR[]
  kpis: KPI[]
  year: number
}

export const AnnualView = ({ okrs, kpis, year }: AnnualViewProps) => {
  const trendData = calculateAnnualTrend(okrs, kpis, year)

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-sm border-t-4 border-t-primary">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-primary" />
            <CardTitle>Evolução Anual de Performance ({year})</CardTitle>
          </div>
          <CardDescription>
            Tendência consolidada de progresso dos OKRs mês a mês
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ChartContainer
              config={{
                progress: { label: 'Progresso Médio', color: '#003366' },
              }}
            >
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003366" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#003366" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `${val}%`}
                  domain={[0, 100]}
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="progress"
                  stroke="#003366"
                  fillOpacity={1}
                  fill="url(#fillProgress)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Additional annual breakdown cards could go here */}
      </div>
    </div>
  )
}
