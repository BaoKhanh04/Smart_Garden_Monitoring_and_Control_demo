import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'
import { cn } from '@/lib/utils'
import {
  Sprout,
  Sun,
  Cloud,
  CloudRain,
  AlertTriangle,
  Activity,
  Thermometer,
  Droplets,
  Lightbulb,
  X,
  ArrowRight,
  Zap
} from 'lucide-react'
import {
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts'

interface SparklineProps {
  data: number[]
  color: string
  width?: number
  height?: number
}

function Sparkline({ data, color, width = 80, height = 24 }: SparklineProps) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface SensorCardProps {
  name: string
  zone: string
  value: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  lastUpdated: string
  sparklineData: number[]
  threshold?: { min: number; max: number }
}

function SensorCard({ name, zone, value, unit, status, lastUpdated, sparklineData, threshold }: SensorCardProps) {
  const statusColors = {
    normal: 'emerald',
    warning: 'amber',
    critical: 'red'
  }

  const statusBgColors = {
    normal: 'bg-emerald-500/10',
    warning: 'bg-amber-500/10',
    critical: 'bg-red-500/10'
  }

  const statusTextColors = {
    normal: 'text-emerald-400',
    warning: 'text-amber-400',
    critical: 'text-red-400'
  }

  const statusBorderColors = {
    normal: 'border-emerald-500/30',
    warning: 'border-amber-500/30',
    critical: 'border-red-500/30'
  }

  const sparklineColor = status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981'

  return (
    <div
      className={cn(
        'bg-card rounded-xl p-5 border transition-all duration-200 hover:-translate-y-1',
        statusBorderColors[status],
        status === 'critical' && 'animate-pulse'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-foreground/80">{name}</h3>
          <p className="text-xs text-muted-foreground">{zone}</p>
        </div>
        <span className={cn(
          'px-2 py-1 rounded-full text-xs font-medium',
          statusBgColors[status],
          statusTextColors[status]
        )}>
          {status === 'normal' ? 'Bình thường' : status === 'warning' ? 'Cảnh báo' : 'Nguy hiểm'}
        </span>
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <span className="text-2xl font-bold text-foreground">
            {typeof value === 'number' ? value.toFixed(1) : value}
          </span>
          <span className="text-sm text-muted-foreground ml-1">{unit}</span>
        </div>
        <Sparkline data={sparklineData} color={sparklineColor} />
      </div>

      {threshold && (
        <div className="mb-3 text-xs text-muted-foreground">
          Ngưỡng: {threshold.min} - {threshold.max} {unit}
        </div>
      )}

      <div className="text-xs text-muted-foreground/60">
        Cập nhật: {lastUpdated}
      </div>
    </div>
  )
}

function SensorSkeleton() {
  return (
    <div className="bg-card rounded-xl p-5 border border-border animate-pulse">
      <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
      <div className="h-3 bg-muted rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-muted rounded w-1/4"></div>
    </div>
  )
}

interface PlantHealthGaugeProps {
  score: number
  status: string
}

function PlantHealthGauge({ score, status }: PlantHealthGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    const duration = 1500
    const steps = 60
    const increment = score / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setDisplayScore(score)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.round(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score])

  const getScoreColor = (value: number) => {
    if (value >= 90) return '#10b981'
    if (value >= 70) return '#14b8a6'
    if (value >= 50) return '#f59e0b'
    return '#ef4444'
  }

  const getScoreStatus = (value: number) => {
    if (value >= 90) return { text: 'Tốt', color: 'text-emerald-400' }
    if (value >= 70) return { text: 'Khá', color: 'text-teal-400' }
    if (value >= 50) return { text: 'Trung bình', color: 'text-amber-400' }
    return { text: 'Kém', color: 'text-red-400' }
  }

  const color = getScoreColor(displayScore)
  const statusInfo = getScoreStatus(displayScore)
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (displayScore / 100) * circumference

  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Sprout className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-medium text-foreground">Sức khỏe cây trồng</h3>
      </div>

      <div className="flex items-center justify-center">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-100"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color }}>
              {displayScore}
            </span>
            <span className={cn('text-xs font-medium', statusInfo.color)}>
              {statusInfo.text}
            </span>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-2">
        {status}
      </p>
    </div>
  )
}

interface WeatherWidgetProps {
  weather: {
    current: { temp_c: number; weather_code: string; humidity_pct: number }
    alert: { active: boolean; severity: string; message: string }
  }
}

function WeatherWidget({ weather }: WeatherWidgetProps) {
  const { current, alert } = weather

  const getWeatherIcon = (code: string) => {
    switch (code) {
      case 'sunny':
        return <Sun className="w-8 h-8 text-amber-400" />
      case 'partly_cloudy':
        return <Cloud className="w-8 h-8 text-slate-400" />
      case 'cloudy':
        return <Cloud className="w-8 h-8 text-slate-500" />
      case 'rain':
        return <CloudRain className="w-8 h-8 text-blue-400" />
      default:
        return <Sun className="w-8 h-8 text-amber-400" />
    }
  }

  const getWeatherLabel = (code: string) => {
    switch (code) {
      case 'sunny':
        return 'Nắng'
      case 'partly_cloudy':
        return 'Trời có mây'
      case 'cloudy':
        return 'Nhiều mây'
      case 'rain':
        return 'Mưa'
      default:
        return 'Nắng'
    }
  }

  return (
    <Link
      to="/dashboard/weather"
      className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-all duration-200 block"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getWeatherIcon(current.weather_code)}
          <h3 className="text-sm font-medium text-foreground">Thời tiết</h3>
        </div>
        {alert.active && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Cảnh báo
          </span>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <span className="text-3xl font-bold text-foreground">{current.temp_c}°C</span>
          <p className="text-sm text-muted-foreground">{getWeatherLabel(current.weather_code)}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span>{current.humidity_pct}%</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

interface QuickStatsProps {
  activeDevices: number
  pendingAlerts: number
  waterSaved: number
}

function QuickStats({ activeDevices, pendingAlerts, waterSaved }: QuickStatsProps) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-medium text-foreground">Tóm tắt</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-sm text-muted-foreground">Thiết bị hoạt động</span>
          </div>
          <span className="text-sm font-semibold text-foreground">{activeDevices}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-sm text-muted-foreground">Cảnh báo chờ</span>
          </div>
          <span className="text-sm font-semibold text-foreground">{pendingAlerts}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-muted-foreground">Nước tiết kiệm</span>
          </div>
          <span className="text-sm font-semibold text-emerald-400">{waterSaved}%</span>
        </div>
      </div>
    </div>
  )
}

interface AlertBannerProps {
  message: string
  onDismiss: () => void
}

function AlertBanner({ message, onDismiss }: AlertBannerProps) {
  return (
    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center justify-between mb-6 animate-slide-down">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
        <p className="text-sm text-red-200">{message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="p-1 hover:bg-red-500/20 rounded transition-colors"
        aria-label="Đóng thông báo"
      >
        <X className="w-4 h-4 text-red-400" />
      </button>
    </div>
  )
}

interface NotificationCardProps {
  notification: {
    id: string
    level: string
    message: string
    timestamp: string
    read: boolean
  }
  onDismiss: (id: string) => void
}

function NotificationCard({ notification, onDismiss }: NotificationCardProps) {
  const levelColors = {
    critical: 'border-l-red-500',
    warning: 'border-l-amber-500',
    info: 'border-l-blue-500'
  }

  const levelBgColors = {
    critical: 'bg-red-500/5',
    warning: 'bg-amber-500/5',
    info: 'bg-blue-500/5'
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 60) return `${minutes} phút trước`
    if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ trước`
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <div
      className={cn(
        'bg-card rounded-lg p-4 border border-border border-l-4',
        levelColors[notification.level as keyof typeof levelColors],
        levelBgColors[notification.level as keyof typeof levelBgColors]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-foreground/80 flex-1">{notification.message}</p>
        <button
          onClick={() => onDismiss(notification.id)}
          className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{formatTime(notification.timestamp)}</p>
    </div>
  )
}

export default function OverviewPage() {
  const { latestSensorData, thresholds, weather, notifications, dismissNotification, waterUsage, devices, isConnected } = useApp()
  const [dismissedBanner, setDismissedBanner] = useState(false)

  const criticalNotification = notifications.find(n => n.level === 'critical' && !n.read && !dismissedBanner)

  const handleDismissBanner = useCallback(() => {
    setDismissedBanner(true)
  }, [])

  const activeDevices = devices.filter(d => d.status !== 'offline').length
  const pendingAlerts = notifications.filter(n => n.level !== 'info' && !n.read).length
  const waterSaved = waterUsage.summary.saved_vs_baseline_pct

  const generateSparklineData = useCallback((baseValue: number, variance: number = 5) => {
    return Array.from({ length: 10 }, () => baseValue + (Math.random() - 0.5) * variance * 2)
  }, [])

  const getSensorStatus = useCallback((value: number, threshold?: { min: number; max: number }): 'normal' | 'warning' | 'critical' => {
    if (!threshold) return 'normal'
    if (value < threshold.min * 0.8 || value > threshold.max * 1.2) return 'critical'
    if (value < threshold.min || value > threshold.max) return 'warning'
    return 'normal'
  }, [])

  const dht1 = latestSensorData.dht1 as { temp: number; humidity: number; zone: number } | undefined
  const soil1 = latestSensorData.soil1 as { moisture_pct: number } | undefined
  const soil2 = latestSensorData.soil2 as { moisture_pct: number } | undefined
  const light = latestSensorData.light as { lux: number } | undefined
  const ph = latestSensorData.ph as { ph_value: number } | undefined
  const systemHealth = latestSensorData.system_health as { plant_score: number; plant_status: string } | undefined

  const sensors = [
    {
      name: 'Nhiệt độ KK',
      zone: 'Zone 1',
      value: dht1?.temp ?? 0,
      unit: '°C',
      status: getSensorStatus(dht1?.temp ?? 0, thresholds.thresholds.temperature),
      lastUpdated: '3 giây trước',
      sparklineData: generateSparklineData(dht1?.temp ?? 30, 0.5),
      threshold: thresholds.thresholds.temperature
    },
    {
      name: 'Độ ẩm KK',
      zone: 'Zone 1',
      value: dht1?.humidity ?? 0,
      unit: '%',
      status: getSensorStatus(dht1?.humidity ?? 0, thresholds.thresholds.air_humidity),
      lastUpdated: '3 giây trước',
      sparklineData: generateSparklineData(dht1?.humidity ?? 65, 2),
      threshold: thresholds.thresholds.air_humidity
    },
    {
      name: 'Cường độ sáng',
      zone: 'BH1750',
      value: light?.lux ?? 0,
      unit: ' lux',
      status: getSensorStatus(light?.lux ?? 0, thresholds.thresholds.light_lux),
      lastUpdated: '3 giây trước',
      sparklineData: generateSparklineData((light?.lux ?? 25000) / 1000, 200),
      threshold: thresholds.thresholds.light_lux
    },
    {
      name: 'Độ ẩm đất',
      zone: 'Zone 1',
      value: soil1?.moisture_pct ?? 0,
      unit: '%',
      status: getSensorStatus(soil1?.moisture_pct ?? 0, thresholds.thresholds.soil_moisture),
      lastUpdated: '3 giây trước',
      sparklineData: generateSparklineData(soil1?.moisture_pct ?? 45, 3),
      threshold: thresholds.thresholds.soil_moisture
    },
    {
      name: 'Độ ẩm đất',
      zone: 'Zone 2',
      value: soil2?.moisture_pct ?? 0,
      unit: '%',
      status: getSensorStatus(soil2?.moisture_pct ?? 0, thresholds.thresholds.soil_moisture),
      lastUpdated: '5 giây trước',
      sparklineData: generateSparklineData(soil2?.moisture_pct ?? 55, 2),
      threshold: thresholds.thresholds.soil_moisture
    },
    {
      name: 'pH',
      zone: 'EC/pH Sensor',
      value: ph?.ph_value ?? 0,
      unit: ' pH',
      status: getSensorStatus(ph?.ph_value ?? 0, thresholds.thresholds.ph),
      lastUpdated: '10 giây trước',
      sparklineData: generateSparklineData(ph?.ph_value ?? 6.5, 0.1),
      threshold: thresholds.thresholds.ph
    }
  ]

  const recentNotifications = notifications.slice(0, 3)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-heading">Tổng quan vườn</h1>
          <p className="text-sm text-muted-foreground mt-1">Giám sát và điều khiển khu vườn thông minh của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'w-2 h-2 rounded-full',
            isConnected ? 'bg-emerald-500' : 'bg-red-500'
          )}></span>
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Đã kết nối' : 'Offline'}
          </span>
        </div>
      </div>

      {criticalNotification && (
        <AlertBanner
          message={criticalNotification.message}
          onDismiss={handleDismissBanner}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlantHealthGauge
          score={systemHealth?.plant_score ?? 0}
          status={systemHealth?.plant_status ?? 'Đang tải...'}
        />
        <WeatherWidget weather={weather} />
        <QuickStats
          activeDevices={activeDevices}
          pendingAlerts={pendingAlerts}
          waterSaved={waterSaved}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Cảm biến</h2>
          <Link
            to="/dashboard/sensors"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.keys(latestSensorData).length === 0 ? (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <SensorSkeleton key={i} />
              ))}
            </>
          ) : (
            sensors.map((sensor, index) => (
              <SensorCard key={index} {...sensor} />
            ))
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Thông báo gần đây</h2>
          <Link
            to="/notifications"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onDismiss={dismissNotification}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
