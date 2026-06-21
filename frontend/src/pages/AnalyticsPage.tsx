import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Brush,
  ReferenceArea,
} from 'recharts'
import { Download, RotateCcw, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'

type SensorType = 'temperature' | 'humidity' | 'soilMoisture' | 'light' | 'ph'
type TimeRange = 7 | 30 | 90

interface ChartDataPoint {
  date: string
  displayDate: string
  timestamp: number
  temperature: number | null
  humidity: number | null
  soilMoisture: number | null
  light: number | null
  ph: number | null
}

const SENSOR_CONFIG: Record<SensorType, { label: string; color: string; unit: string; yAxisDomain?: [number, number] }> = {
  temperature: { label: 'Nhiệt độ', color: '#ef4444', unit: '°C', yAxisDomain: [20, 45] },
  humidity: { label: 'Độ ẩm', color: '#3b82f6', unit: '%', yAxisDomain: [0, 100] },
  soilMoisture: { label: 'Độ ẩm đất', color: '#22c55e', unit: '%', yAxisDomain: [0, 100] },
  light: { label: 'Ánh sáng', color: '#eab308', unit: ' lux', yAxisDomain: [0, 50000] },
  ph: { label: 'pH', color: '#a855f7', unit: '', yAxisDomain: [4, 9] },
}

function generateMockHistoricalData(days: TimeRange): ChartDataPoint[] {
  const data: ChartDataPoint[] = []
  const now = new Date()
  const baseTemp = 30
  const baseHumidity = 65
  const baseSoilMoisture = 45
  const baseLight = 25000
  const basePh = 6.5

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    const tempVariation = Math.sin((i / days) * Math.PI) * 5 + (Math.random() - 0.5) * 3
    const humidityVariation = -tempVariation * 1.5 + (Math.random() - 0.5) * 5
    const soilVariation = Math.random() * 10 - 3
    const lightVariation = (Math.random() - 0.5) * 5000 + (isWeekend ? 2000 : 0)
    const phVariation = (Math.random() - 0.5) * 0.5

    data.push({
      date: date.toISOString().split('T')[0],
      displayDate: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      timestamp: date.getTime(),
      temperature: parseFloat((baseTemp + tempVariation).toFixed(1)),
      humidity: parseFloat(Math.max(30, Math.min(95, baseHumidity + humidityVariation)).toFixed(1)),
      soilMoisture: parseFloat(Math.max(15, Math.min(80, baseSoilMoisture + soilVariation)).toFixed(1)),
      light: Math.floor(Math.max(5000, Math.min(45000, baseLight + lightVariation))),
      ph: parseFloat(Math.max(5, Math.min(8, basePh + phVariation)).toFixed(2)),
    })
  }
  return data
}

function exportToCsv(data: ChartDataPoint[], selectedSensors: SensorType[]) {
  const headers = ['Ngày', ...selectedSensors.map(s => SENSOR_CONFIG[s].label + ' (' + SENSOR_CONFIG[s].unit + ')')]
  const rows = data.map(point => [
    point.date,
    ...selectedSensors.map(s => point[s]?.toString() ?? ''),
  ])

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `sensor_data_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function AnalyticsPage() {
  const { latestSensorData } = useApp()
  const [selectedSensors, setSelectedSensors] = useState<Set<SensorType>>(
    new Set(['temperature', 'humidity', 'soilMoisture'] as SensorType[])
  )
  const [timeRange, setTimeRange] = useState<TimeRange>(7)
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null)
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null)
  const [zoomDomain, setZoomDomain] = useState<{ left: string; right: string } | null>(null)

  const data = useMemo(() => generateMockHistoricalData(timeRange), [timeRange])
  const displayData = useMemo(() => {
    if (!zoomDomain) return data
    return data.filter(d => d.date >= zoomDomain.left && d.date <= zoomDomain.right)
  }, [data, zoomDomain])

  const toggleSensor = (sensor: SensorType) => {
    setSelectedSensors(prev => {
      const next = new Set(prev)
      if (next.has(sensor)) {
        if (next.size === 1) return prev
        next.delete(sensor)
      } else {
        next.add(sensor)
      }
      return next
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMouseDown = (e: any) => {
    if (e?.activeLabel) setRefAreaLeft(e.activeLabel)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMouseMove = (e: any) => {
    if (refAreaLeft && e?.activeLabel) setRefAreaRight(e.activeLabel)
  }

  const handleMouseUp = () => {
    if (refAreaLeft && refAreaRight) {
      const left = refAreaLeft < refAreaRight ? refAreaLeft : refAreaRight
      const right = refAreaLeft < refAreaRight ? refAreaRight : refAreaLeft
      setZoomDomain({ left, right })
    }
    setRefAreaLeft(null)
    setRefAreaRight(null)
  }

  const resetZoom = () => {
    setZoomDomain(null)
    setRefAreaLeft(null)
    setRefAreaRight(null)
  }

  const getLatestSensorValue = (sensor: SensorType): string => {
    const sensorMap: Record<SensorType, string> = {
      temperature: 'dht1.temp',
      humidity: 'dht1.humidity',
      soilMoisture: 'soil1.moisture_pct',
      light: 'light.lux',
      ph: 'ph.ph_value',
    }
    const path = sensorMap[sensor]
    const keys = path.split('.')
    let value: unknown = latestSensorData
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k]
      } else {
        return '—'
      }
    }
    if (typeof value === 'number') {
      if (sensor === 'light') return value.toLocaleString()
      return value.toString()
    }
    return '—'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Phân tích lịch sử</h1>
          <p className="text-muted-foreground mt-1">Dữ liệu cảm biến theo thời gian</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="w-4 h-4" />
          <span>Cập nhật: {getLatestSensorValue('temperature')}</span>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Chọn cảm biến</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SENSOR_CONFIG) as SensorType[]).map(sensor => {
                const config = SENSOR_CONFIG[sensor]
                const isSelected = selectedSensors.has(sensor)
                return (
                  <label
                    key={sensor}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all',
                      'hover:border-primary/50',
                      isSelected
                        ? 'bg-primary/10 border-primary/50 text-foreground'
                        : 'bg-background border-border text-muted-foreground'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSensor(sensor)}
                      className="sr-only"
                    />
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="text-sm font-medium">{config.label}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({getLatestSensorValue(sensor)}{config.unit})
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Khoảng thời gian</label>
            <div className="flex gap-1 bg-background rounded-lg p-1 border border-border">
              {([7, 30, 90] as TimeRange[]).map(days => (
                <button
                  key={days}
                  onClick={() => { setTimeRange(days); resetZoom() }}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium transition-all',
                    timeRange === days
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {days} ngày
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-[400px] bg-background rounded-lg p-4 border border-border">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={displayData}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.03 240)" />
              <XAxis
                dataKey="displayDate"
                stroke="oklch(0.70 0.02 240)"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="oklch(0.70 0.02 240)"
                fontSize={12}
                tickLine={false}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.22 0.03 240)',
                  border: '1px solid oklch(0.28 0.03 240)',
                  borderRadius: '0.75rem',
                  color: 'oklch(0.98 0.01 240)',
                }}
                labelStyle={{ color: 'oklch(0.98 0.01 240)', fontWeight: 600 }}
                itemStyle={{ color: 'oklch(0.98 0.01 240)' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => {
                  const config = SENSOR_CONFIG[name as SensorType]
                  return [`${value}${config?.unit ?? ''}`, config?.label ?? name]
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                labelFormatter={(label: any, payload: any) => {
                  if (!payload?.length) return label
                  const timestamp = payload[0]?.payload?.timestamp
                  if (timestamp) {
                    return new Date(timestamp).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  }
                  return label
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '16px' }}
                formatter={(value: string) => SENSOR_CONFIG[value as SensorType]?.label ?? value}
              />
              {(Object.keys(SENSOR_CONFIG) as SensorType[]).map(sensor => {
                if (!selectedSensors.has(sensor)) return null
                const config = SENSOR_CONFIG[sensor]
                return (
                  <Line
                    key={sensor}
                    type="monotone"
                    dataKey={sensor}
                    stroke={config.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2 }}
                    connectNulls
                  />
                )
              })}
              {refAreaLeft && refAreaRight ? (
                <ReferenceArea
                  x1={refAreaLeft}
                  x2={refAreaRight}
                  strokeOpacity={0.3}
                  fill="oklch(0.70 0.19 145)"
                  fillOpacity={0.2}
                />
              ) : null}
              <Brush
                dataKey="displayDate"
                height={30}
                stroke="oklch(0.70 0.19 145)"
                fill="oklch(0.22 0.03 240)"
                tickFormatter={() => ''}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Kéo chọn vùng trên biểu đồ để zoom. Sử dụng Brush bên dưới để điều chỉnh.
          </p>
          <div className="flex gap-2">
            <button
              onClick={resetZoom}
              disabled={!zoomDomain}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                zoomDomain
                  ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              <RotateCcw className="w-4 h-4" />
              Reset Zoom
            </button>
            <button
              onClick={() => exportToCsv(data, Array.from(selectedSensors))}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
