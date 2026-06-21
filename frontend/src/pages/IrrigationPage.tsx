import { useState, useMemo } from 'react'
import { CloudRain, Droplets, Clock, SkipForward, Play, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { MOCK_IRRIGATION_SCHEDULE, MOCK_WEATHER } from '@/mocks/data'
import type { IrrigationSchedule } from '@/types'

type TabType = 'today' | 'tomorrow'

const MOCK_TOMORROW_SCHEDULE: IrrigationSchedule[] = [
  {
    id: 'sched_03',
    time: '2026-06-22T08:00:00Z',
    duration_minutes: 20,
    status: 'PENDING',
    predicted_by: 'Random Forest AI',
    reason: 'Nhiệt độ dự báo 39°C vào ngày mai — tăng thời gian tưới để bù thoát hơi nước.'
  },
  {
    id: 'sched_04',
    time: '2026-06-22T18:00:00Z',
    duration_minutes: 15,
    status: 'PENDING',
    predicted_by: 'Random Forest AI',
    reason: 'Duy trì độ ẩm đất sau ngày nắng nóng.'
  }
]

const STATUS_STYLES = {
  PENDING: {
    badge: 'text-blue-400 bg-blue-400/10 border border-blue-400/30',
    label: 'Chờ thực hiện'
  },
  COMPLETED: {
    badge: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/30',
    label: 'Đã hoàn thành'
  },
  SKIPPED: {
    badge: 'text-muted-foreground bg-muted/10 border border-muted/30',
    label: 'Đã bỏ qua'
  }
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })
}

function getHourFromTime(dateStr: string): number {
  const date = new Date(dateStr)
  return date.getHours() + date.getMinutes() / 60
}

function TimelineVisualization({
  schedules,
  showNowMarker = false
}: {
  schedules: IrrigationSchedule[]
  showNowMarker?: boolean
}) {
  const currentHour = new Date().getHours() + new Date().getMinutes() / 60
  const nowPosition = (currentHour / 24) * 100

  const hourMarkers = Array.from({ length: 25 }, (_, i) => i)

  return (
    <div className="relative h-16 bg-muted rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex">
        {hourMarkers.map((hour) => (
          <div
            key={hour}
            className={cn(
              'flex-1 border-r border-border/30',
              hour === 0 && 'border-l border-border/30'
            )}
          >
            {hour % 6 === 0 && (
              <div className="absolute top-1 text-[10px] text-muted-foreground/70 font-medium">
                {hour}h
              </div>
            )}
          </div>
        ))}
      </div>

      {showNowMarker && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
          style={{ left: `${nowPosition}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-red-500" />
        </div>
      )}

      <div className="absolute inset-0 flex items-center px-2">
        {schedules.map((schedule) => {
          const startHour = getHourFromTime(schedule.time)
          const leftPos = (startHour / 24) * 100
          const widthPercent = (schedule.duration_minutes / 60 / 24) * 100
          const clampedWidth = Math.max(widthPercent, 2)

          return (
            <div
              key={schedule.id}
              className="absolute top-2 bottom-2 bg-primary/20 border border-primary/40 rounded-md p-2 flex flex-col justify-center overflow-hidden"
              style={{
                left: `${leftPos}%`,
                width: `${clampedWidth}%`,
                minWidth: schedule.duration_minutes >= 10 ? '60px' : '40px'
              }}
            >
              <div className="text-[10px] font-medium text-primary truncate">
                {formatTime(schedule.time)}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {schedule.duration_minutes} phút
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ScheduleCard({
  schedule,
  hasRainForecast = false
}: {
  schedule: IrrigationSchedule
  hasRainForecast?: boolean
}) {
  const statusStyle = STATUS_STYLES[schedule.status]

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-card-foreground">
                {formatTime(schedule.time)}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                {schedule.duration_minutes} phút
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {formatDate(schedule.time)}
            </div>
          </div>
        </div>

        <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', statusStyle.badge)}>
          {statusStyle.label}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <Brain className="w-3.5 h-3.5 text-primary/70" />
        <span className="text-primary/70">{schedule.predicted_by}</span>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {schedule.reason}
      </p>

      {hasRainForecast && schedule.status === 'PENDING' && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <CloudRain className="w-4 h-4 text-amber-500" />
          <span className="text-sm text-amber-500 font-medium">
            Có mưa dự báo — có thể cần điều chỉnh lịch tưới
          </span>
        </div>
      )}
    </div>
  )
}

function WeatherAlertCard() {
  if (!MOCK_WEATHER.alert.active) return null

  const severityColors = {
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
    critical: 'bg-red-500/10 border-red-500/30 text-red-500',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-500'
  }

  const severityColor = severityColors[MOCK_WEATHER.alert.severity as keyof typeof severityColors] || severityColors.warning

  return (
    <div className={cn('p-4 rounded-xl border', severityColor)}>
      <div className="flex items-start gap-3">
        <CloudRain className="w-5 h-5 mt-0.5" />
        <div>
          <p className="font-medium">Cảnh báo thời tiết</p>
          <p className="text-sm opacity-90 mt-1">{MOCK_WEATHER.alert.message}</p>
        </div>
      </div>
    </div>
  )
}

export default function IrrigationPage() {
  const [activeTab, setActiveTab] = useState<TabType>('today')
  const { user } = useAuth()
  const isOwner = user?.role === 'OWNER'

  const todaySchedules = MOCK_IRRIGATION_SCHEDULE
  const tomorrowSchedules = MOCK_TOMORROW_SCHEDULE

  const currentSchedules = activeTab === 'today' ? todaySchedules : tomorrowSchedules
  const hasRainForecast = MOCK_WEATHER.daily.some(d => d.rain_chance_pct >= 60)

  const nextSchedule = useMemo(() => {
    if (activeTab !== 'today') return null
    return todaySchedules.find(s => s.status === 'PENDING')
  }, [activeTab, todaySchedules])

  const handleOverride = () => {
    console.log('Override next schedule:', nextSchedule?.id)
  }

  const handleWaterNow = () => {
    console.log('Water now triggered')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Lịch tưới thông minh
        </h1>
        <p className="text-muted-foreground flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          Lịch tưới được tối ưu bởi thuật toán Random Forest AI dựa trên dữ liệu cảm biến và thời tiết
        </p>
      </div>

      {/* Weather Alert */}
      <WeatherAlertCard />

      {/* Day Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('today')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
            activeTab === 'today'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Hôm nay
        </button>
        <button
          onClick={() => setActiveTab('tomorrow')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
            activeTab === 'tomorrow'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Ngày mai
        </button>
      </div>

      {/* Timeline Visualization */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Timeline tưới — {activeTab === 'today' ? formatDate(new Date().toISOString()) : 'Ngày mai'}
        </h2>
        <TimelineVisualization
          schedules={currentSchedules}
          showNowMarker={activeTab === 'today'}
        />
      </div>

      {/* Action Buttons (Owner Only) */}
      {isOwner && (
        <div className="flex gap-3">
          <button
            onClick={handleOverride}
            disabled={!nextSchedule}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-sm font-medium',
              'hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30',
              'transition-colors duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-foreground disabled:hover:border-border'
            )}
          >
            <SkipForward className="w-4 h-4" />
            Bỏ qua lịch tưới tiếp theo
          </button>
          <button
            onClick={handleWaterNow}
            className={cn(
              'flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90',
              'transition-colors duration-200'
            )}
          >
            <Play className="w-4 h-4" />
            Tưới ngay
          </button>
        </div>
      )}

      {/* Schedule Cards List */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          Danh sách lịch tưới ({currentSchedules.length})
        </h2>
        <div className="grid gap-4">
          {currentSchedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              hasRainForecast={hasRainForecast}
            />
          ))}
        </div>
      </div>

      {/* Empty State */}
      {currentSchedules.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Droplets className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Không có lịch tưới nào cho ngày này</p>
        </div>
      )}
    </div>
  )
}
