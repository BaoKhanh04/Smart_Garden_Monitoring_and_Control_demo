import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  ReferenceLine,
} from 'recharts'
import { Droplets, TrendingUp, TrendingDown, Download, PiggyBank } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'

type TimeRange = 'day' | 'week' | 'month'

interface ExtendedDailyData {
  date: string
  displayDate: string
  liters: number
  zone1: number
  zone2: number
  baseline: number
  dayLabel: string
}

function generateWaterData(range: TimeRange): ExtendedDailyData[] {
  const data: ExtendedDailyData[] = []
  const now = new Date()

  let days: number
  switch (range) {
    case 'day':
      days = 24
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(now)
        hour.setHours(hour.getHours() - i)
        const baseFlow = Math.sin((hour.getHours() / 24) * Math.PI) * 0.5 + 0.5
        const liters = parseFloat((baseFlow * 1.5 + Math.random() * 0.3).toFixed(2))
        data.push({
          date: hour.toISOString(),
          displayDate: `${hour.getHours()}:00`,
          liters,
          zone1: parseFloat((liters * 0.55).toFixed(2)),
          zone2: parseFloat((liters * 0.45).toFixed(2)),
          baseline: 1.2,
          dayLabel: `${hour.getHours()}:00`,
        })
      }
      break
    case 'week':
      days = 7
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        const base = isWeekend ? 18 : 22
        const liters = parseFloat((base + (Math.random() - 0.5) * 6).toFixed(1))
        data.push({
          date: date.toISOString().split('T')[0],
          displayDate: date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
          liters,
          zone1: parseFloat((liters * 0.55).toFixed(1)),
          zone2: parseFloat((liters * 0.45).toFixed(1)),
          baseline: 30,
          dayLabel: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
        })
      }
      break
    case 'month':
      days = 30
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        const base = isWeekend ? 18 : 22
        const liters = parseFloat((base + (Math.random() - 0.5) * 6).toFixed(1))
        data.push({
          date: date.toISOString().split('T')[0],
          displayDate: date.toLocaleDateString('vi-VN', { day: '2-digit' }),
          liters,
          zone1: parseFloat((liters * 0.55).toFixed(1)),
          zone2: parseFloat((liters * 0.45).toFixed(1)),
          baseline: 30,
          dayLabel: date.getDate().toString(),
        })
      }
      break
  }

  return data
}

function exportWaterCsv(data: ExtendedDailyData[], range: TimeRange) {
  const headers = ['Ngày/Giờ', 'Tổng (lít)', 'Zone 1 (lít)', 'Zone 2 (lít)', 'Baseline (lít)']
  const rows = data.map(point => [
    point.date,
    point.liters.toString(),
    point.zone1.toString(),
    point.zone2.toString(),
    point.baseline.toString(),
  ])

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `water_usage_${range}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function WaterUsagePage() {
  const { waterUsage } = useApp()
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [showBaseline, setShowBaseline] = useState(true)

  const data = useMemo(() => generateWaterData(timeRange), [timeRange])

  const summary = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.liters, 0)
    const baseline = data.reduce((sum, d) => sum + d.baseline, 0)
    const saved = baseline - total
    const savedPct = (saved / baseline) * 100
    const changePct = timeRange === 'week' ? waterUsage.summary.change_pct : -5.2

    return {
      totalLiters: parseFloat(total.toFixed(1)),
      changePct: parseFloat(changePct.toFixed(1)),
      savedPct: parseFloat(savedPct.toFixed(1)),
    }
  }, [data, waterUsage, timeRange])

  const rangeLabels = { day: 'Ngày', week: 'Tuần', month: 'Tháng' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Tiêu thụ nước</h1>
          <p className="text-muted-foreground mt-1">Theo dõi lượng nước tưới tiêu</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Tổng lượng nước</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{summary.totalLiters} L</p>
          <p className="text-sm text-muted-foreground mt-1">
            {rangeLabels[timeRange]} này
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              summary.changePct < 0 ? 'bg-green-500/20' : 'bg-red-500/20'
            )}>
              {summary.changePct < 0 ? (
                <TrendingDown className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingUp className="w-5 h-5 text-red-500" />
              )}
            </div>
            <span className="text-sm font-medium text-muted-foreground">Thay đổi</span>
          </div>
          <p className={cn(
            'text-3xl font-bold',
            summary.changePct < 0 ? 'text-green-500' : 'text-red-500'
          )}>
            {summary.changePct > 0 ? '+' : ''}{summary.changePct}%
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            So với {rangeLabels[timeRange]} trước
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Tiết kiệm</span>
          </div>
          <p className="text-3xl font-bold text-emerald-500">{summary.savedPct.toFixed(0)}%</p>
          <p className="text-sm text-muted-foreground mt-1">
            So với baseline
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="bg-background rounded-lg p-1 border border-border inline-flex">
            {(Object.keys(rangeLabels) as TimeRange[]).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  timeRange === range
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {rangeLabels[range]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-sm font-medium text-foreground">Baseline</span>
              <button
                onClick={() => setShowBaseline(!showBaseline)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors',
                  showBaseline ? 'bg-primary' : 'bg-muted'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                    showBaseline && 'translate-x-5'
                  )}
                />
              </button>
            </label>

            <button
              onClick={() => exportWaterCsv(data, timeRange)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="h-[350px] bg-background rounded-lg p-4 border border-border">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.03 240)" vertical={false} />
              <XAxis
                dataKey={timeRange === 'day' ? 'displayDate' : 'displayDate'}
                stroke="oklch(0.70 0.02 240)"
                fontSize={12}
                tickLine={false}
                interval={timeRange === 'month' ? 4 : 0}
              />
              <YAxis
                stroke="oklch(0.70 0.02 240)"
                fontSize={12}
                tickLine={false}
                tickFormatter={(v: number) => `${v}L`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.22 0.03 240)',
                  border: '1px solid oklch(0.28 0.03 240)',
                  borderRadius: '0.75rem',
                  color: 'oklch(0.98 0.01 240)',
                }}
                labelStyle={{ color: 'oklch(0.98 0.01 240)', fontWeight: 600 }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => {
                  const labels: Record<string, string> = {
                    liters: 'Tổng',
                    zone1: 'Zone 1',
                    zone2: 'Zone 2',
                    baseline: 'Baseline',
                  }
                  return [`${value} L`, labels[name] ?? name]
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '16px' }}
                formatter={(value: string) => {
                  const labels: Record<string, string> = {
                    liters: 'Tổng',
                    zone1: 'Zone 1',
                    zone2: 'Zone 2',
                    baseline: 'Baseline',
                  }
                  return labels[value] ?? value
                }}
              />
              <ReferenceLine
                y={30}
                stroke="oklch(0.70 0.19 145)"
                strokeDasharray="5 5"
                label={{
                  value: 'Baseline',
                  position: 'right',
                  fill: 'oklch(0.70 0.19 145)',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="zone1" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="zone2" stackId="a" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              {showBaseline && (
                <Bar dataKey="baseline" fill="transparent" stroke="#22c55e" strokeWidth={2} radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span className="text-sm text-muted-foreground">Zone 1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-400" />
            <span className="text-sm text-muted-foreground">Zone 2</span>
          </div>
        </div>
      </div>
    </div>
  )
}
