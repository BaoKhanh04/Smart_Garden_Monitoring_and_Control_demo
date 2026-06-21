import { useApp } from '@/contexts/AppContext'
import { cn } from '@/lib/utils'
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Droplets,
  Thermometer,
  AlertTriangle,
  Wind,
} from 'lucide-react'

const WEATHER_CODE_CONFIG: Record<string, {
  icon: React.ElementType
  label: string
  bgClass: string
  iconClass: string
}> = {
  sunny: { icon: Sun, label: 'Nắng', bgClass: 'bg-amber-500/20', iconClass: 'text-amber-400' },
  partly_cloudy: { icon: CloudSun, label: 'Trời nhiều mây', bgClass: 'bg-amber-400/20', iconClass: 'text-amber-300' },
  cloudy: { icon: Cloud, label: 'Nhiều mây', bgClass: 'bg-slate-500/20', iconClass: 'text-slate-400' },
  rain: { icon: CloudRain, label: 'Mưa', bgClass: 'bg-blue-500/20', iconClass: 'text-blue-400' },
  thunderstorm: { icon: CloudLightning, label: 'Giông sét', bgClass: 'bg-purple-500/20', iconClass: 'text-purple-400' },
}

function getDayName(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (dateStr === today.toISOString().split('T')[0]) return 'Hôm nay'
  if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Ngày mai'

  return date.toLocaleDateString('vi-VN', { weekday: 'short' })
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

export default function WeatherPage() {
  const { weather } = useApp()

  const currentConfig = WEATHER_CODE_CONFIG[weather.current.weather_code] || WEATHER_CODE_CONFIG.cloudy
  const CurrentIcon = currentConfig.icon

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Dự báo thời tiết</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Thông tin thời tiết hiện tại và dự báo 7 ngày tới
        </p>
      </div>

      {/* Weather Alert */}
      {weather.alert.active && (
        <div
          className={cn(
            'rounded-xl p-4 border flex items-start gap-3',
            weather.alert.severity === 'critical'
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-amber-500/10 border-amber-500/30'
          )}
        >
          <AlertTriangle
            className={cn(
              'w-5 h-5 flex-shrink-0 mt-0.5',
              weather.alert.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
            )}
          />
          <div>
            <p
              className={cn(
                'font-medium',
                weather.alert.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
              )}
            >
              Cảnh báo thời tiết
            </p>
            <p className="text-sm text-foreground mt-0.5">{weather.alert.message}</p>
          </div>
        </div>
      )}

      {/* Current Weather Card */}
      <div className="bg-card rounded-2xl border border-border/50 p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Big Weather Icon */}
          <div
            className={cn(
              'w-32 h-32 rounded-2xl flex items-center justify-center',
              currentConfig.bgClass
            )}
          >
            <CurrentIcon className={cn('w-16 h-16', currentConfig.iconClass)} />
          </div>

          {/* Current Weather Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-1">
              Hiện tại
            </h2>
            <div className="flex items-baseline justify-center md:justify-start gap-2 mb-2">
              <span className="text-6xl font-bold text-foreground">
                {weather.current.temp_c}
              </span>
              <span className="text-2xl text-muted-foreground">°C</span>
            </div>
            <p className="text-lg text-foreground mb-4">{currentConfig.label}</p>

            <div className="flex items-center justify-center md:justify-start gap-6">
              {/* Humidity */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Droplets className="w-5 h-5 text-blue-400" />
                <span className="text-sm">
                  <span className="font-medium text-foreground">{weather.current.humidity_pct}</span>% độ ẩm
                </span>
              </div>

              {/* Temperature Icon */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Thermometer className="w-5 h-5 text-red-400" />
                <span className="text-sm">Cảm giác như {weather.current.temp_c + 2}°C</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex flex-wrap justify-center gap-4 text-center">
            <div className="bg-secondary/30 rounded-xl px-4 py-3 border border-border/30">
              <Wind className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Gió</p>
              <p className="font-medium text-foreground">12 km/h</p>
            </div>
            <div className="bg-secondary/30 rounded-xl px-4 py-3 border border-border/30">
              <Droplets className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">UV Index</p>
              <p className="font-medium text-foreground">6 Cao</p>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="bg-card rounded-2xl border border-border/50 p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
          Dự báo 7 ngày tới
        </h2>

        {/* Forecast Strip - Horizontal scroll on mobile */}
        <div className="overflow-x-auto -mx-6 px-6 md:overflow-visible">
          <div className="flex gap-3 md:grid md:grid-cols-7 md:gap-4 min-w-max md:min-w-0">
            {weather.daily.map((day, index) => {
              const config = WEATHER_CODE_CONFIG[day.weather_code] || WEATHER_CODE_CONFIG.cloudy
              const DayIcon = config.icon
              const isToday = index === 0

              return (
                <div
                  key={day.date}
                  className={cn(
                    'flex-shrink-0 w-24 md:w-auto bg-secondary/30 rounded-xl p-3 border transition-all duration-200',
                    isToday
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-border/30 hover:border-border/50'
                  )}
                >
                  {/* Day Name */}
                  <div className="text-center mb-2">
                    <p
                      className={cn(
                        'text-xs font-medium',
                        isToday ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {getDayName(day.date)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDateShort(day.date)}
                    </p>
                  </div>

                  {/* Weather Icon */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg mx-auto flex items-center justify-center mb-2',
                      config.bgClass
                    )}
                  >
                    <DayIcon className={cn('w-6 h-6', config.iconClass)} />
                  </div>

                  {/* Temperature */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sm font-semibold text-foreground">
                        {day.temp_max}°
                      </span>
                      <span className="text-sm text-muted-foreground">
                        /{day.temp_min}°
                      </span>
                    </div>

                    {/* Rain Chance */}
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Droplets className="w-3 h-3 text-blue-400" />
                      <span className="text-xs text-muted-foreground">
                        {day.rain_chance_pct}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t border-border/30">
          {Object.entries(WEATHER_CODE_CONFIG).map(([code, config]) => {
            const Icon = config.icon
            return (
              <div key={code} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className={cn('w-4 h-4', config.iconClass)} />
                <span>{config.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Agricultural Tips */}
      <div className="bg-card rounded-2xl border border-border/50 p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
          Lời khuyên nông nghiệp
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-foreground">Tưới nước</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {weather.daily.slice(0, 2).some(d => d.rain_chance_pct > 50)
                ? 'Có khả năng mưa, cân nhắc giảm tưới trong 2 ngày tới.'
                : 'Trời nắng nóng, cần tưới nước thường xuyên hơn vào sáng sớm.'}
            </p>
          </div>

          <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-5 h-5 text-amber-400" />
              <span className="font-medium text-foreground">Ánh sáng</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {weather.daily.slice(0, 3).filter(d => d.weather_code === 'sunny').length >= 2
                ? 'Nhiều ngày nắng, có thể kéo lưới che nắng nếu nhiệt độ vượt 35°C.'
                : 'Ánh sáng vừa phải, phù hợp cho hầu hết cây trồng.'}
            </p>
          </div>

          <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <CloudRain className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-foreground">Thu hoạch</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {weather.daily.slice(0, 3).some(d => d.rain_chance_pct > 60)
                ? 'Tránh thu hoạch khi trời mưa, lá cây ẩm dễ hư hỏng.'
                : 'Thời tiết thuận lợi cho thu hoạch trong những ngày tới.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
