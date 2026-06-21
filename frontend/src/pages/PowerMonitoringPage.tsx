import { useState, useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Zap, TrendingUp, TrendingDown, AlertTriangle, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'

const DEVICE_COLORS = {
  pump: '#3b82f6',
  fan: '#f59e0b',
  light: '#a855f7',
  shade: '#22c55e',
}

interface DeviceRankingRowProps {
  device: string
  label: string
  kwh: number
  pct: number
  abnormal: boolean
  maxKwh: number
}

function DeviceRankingRow({ device, label, kwh, pct, abnormal, maxKwh }: DeviceRankingRowProps) {
  const barWidth = (kwh / maxKwh) * 100

  return (
    <div className="flex items-center gap-4 py-3">
      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: DEVICE_COLORS[device as keyof typeof DEVICE_COLORS] ?? '#888' }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{label}</span>
            {abnormal && (
              <span className="flex items-center gap-1 text-xs font-medium text-amber-500">
                <AlertTriangle className="w-3 h-3" />
                Bất thường
              </span>
            )}
          </div>
          <span className="text-sm font-semibold text-foreground">{kwh} kWh</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${barWidth}%`,
              backgroundColor: DEVICE_COLORS[device as keyof typeof DEVICE_COLORS] ?? '#888',
            }}
          />
        </div>
      </div>
    </div>
  )
}

function exportPowerCsv(
  summary: { total_kwh: number; estimated_cost_vnd: number; change_pct: number },
  byDevice: { device: string; label: string; kwh: number; pct: number }[],
  daily: { date: string; kwh: number }[]
) {
  const headers = ['Thông tin', 'Giá trị']
  const summaryRows = [
    ['Tổng điện năng', `${summary.total_kwh} kWh`],
    ['Chi phí ước tính', `${summary.estimated_cost_vnd.toLocaleString()} VND`],
    ['Thay đổi', `${summary.change_pct}%`],
    ['', ''],
    ['Thiết bị', 'kWh', '%'],
    ...byDevice.map(d => [d.label, d.kwh.toString(), `${d.pct}%`]),
    ['', ''],
    ['Ngày', 'kWh'],
    ...daily.map(d => [d.date, d.kwh.toString()]),
  ]

  const csvContent = [
    headers.join(','),
    ...summaryRows.map(row => (Array.isArray(row) ? row.join(',') : row))
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `power_usage_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function PowerMonitoringPage() {
  const { powerUsage } = useApp()
  const [showTrend, setShowTrend] = useState(true)

  const pieData = useMemo(() => {
    return powerUsage.by_device.map(device => ({
      name: device.label,
      value: device.kwh,
      device: device.device,
      pct: device.pct,
    }))
  }, [powerUsage.by_device])

  const maxKwh = useMemo(() => {
    return Math.max(...powerUsage.by_device.map(d => d.kwh))
  }, [powerUsage.by_device])

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; pct: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-xl">
          <p className="text-sm font-semibold text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">{data.value} kWh</p>
          <p className="text-xs text-muted-foreground">{data.pct}% tổng</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Tiêu thụ điện</h1>
          <p className="text-muted-foreground mt-1">Theo dõi và phân tích điện năng tiêu thụ</p>
        </div>
        <button
          onClick={() => exportPowerCsv(powerUsage.summary, powerUsage.by_device, powerUsage.daily)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Tổng điện năng</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{powerUsage.summary.total_kwh} kWh</p>
          <p className="text-sm text-muted-foreground mt-1">7 ngày qua</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Chi phí ước tính</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {powerUsage.summary.estimated_cost_vnd.toLocaleString()}đ
          </p>
          <p className="text-sm text-muted-foreground mt-1">~{Math.round(powerUsage.summary.estimated_cost_vnd / 30).toLocaleString()}đ/ngày</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              powerUsage.summary.change_pct < 0 ? 'bg-green-500/20' : 'bg-red-500/20'
            )}>
              {powerUsage.summary.change_pct < 0 ? (
                <TrendingDown className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingUp className="w-5 h-5 text-red-500" />
              )}
            </div>
            <span className="text-sm font-medium text-muted-foreground">Thay đổi</span>
          </div>
          <p className={cn(
            'text-3xl font-bold',
            powerUsage.summary.change_pct < 0 ? 'text-green-500' : 'text-red-500'
          )}>
            {powerUsage.summary.change_pct > 0 ? '+' : ''}{powerUsage.summary.change_pct}%
          </p>
          <p className="text-sm text-muted-foreground mt-1">So với tuần trước</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-6">Phân bổ theo thiết bị</h3>
          <div className="h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.device}
                      fill={DEVICE_COLORS[entry.device as keyof typeof DEVICE_COLORS] ?? '#888'}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{powerUsage.summary.total_kwh}</p>
                <p className="text-xs text-muted-foreground">kWh</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            {powerUsage.by_device.map(device => (
              <div key={device.device} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: DEVICE_COLORS[device.device as keyof typeof DEVICE_COLORS] ?? '#888' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{device.label}</p>
                  <p className="text-xs text-muted-foreground">{device.pct}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Xếp hạng thiết bị</h3>
            {powerUsage.by_device.some(d => d.abnormal) && (
              <span className="flex items-center gap-1 text-xs font-medium text-amber-500">
                <AlertTriangle className="w-3 h-3" />
                Có thiết bị bất thường
              </span>
            )}
          </div>

          <div className="border-b border-border pb-2 mb-2">
            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground px-1">
              <div className="w-3" />
              <div className="flex-1">Thiết bị</div>
              <div className="w-16 text-right">kWh</div>
              <div className="w-16 text-right">%</div>
            </div>
          </div>

          <div className="space-y-1">
            {powerUsage.by_device.map(device => (
              <DeviceRankingRow
                key={device.device}
                device={device.device}
                label={device.label}
                kwh={device.kwh}
                pct={device.pct}
                abnormal={device.abnormal}
                maxKwh={maxKwh}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-foreground">Xu hướng tiêu thụ hàng ngày</h3>
          <button
            onClick={() => setShowTrend(!showTrend)}
            className={cn(
              'relative w-11 h-6 rounded-full transition-colors',
              showTrend ? 'bg-primary' : 'bg-muted'
            )}
          >
            <span
              className={cn(
                'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                showTrend && 'translate-x-5'
              )}
            />
          </button>
        </div>

        <div className="h-[250px] bg-background rounded-lg p-4 border border-border">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={powerUsage.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.03 240)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="oklch(0.70 0.02 240)"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value: string) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                }}
              />
              <YAxis
                stroke="oklch(0.70 0.02 240)"
                fontSize={12}
                tickLine={false}
                tickFormatter={(v: number) => `${v} kWh`}
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
                formatter={(value: any) => [`${value} kWh`, 'Điện năng']}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                labelFormatter={(label: any) => {
                  const date = new Date(label)
                  return date.toLocaleDateString('vi-VN', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                }}
              />
              <Line
                type="monotone"
                dataKey="kwh"
                stroke="#a855f7"
                strokeWidth={2}
                dot={{ fill: '#a855f7', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, strokeWidth: 2, fill: '#a855f7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
