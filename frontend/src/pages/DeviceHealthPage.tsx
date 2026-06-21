import { useState } from 'react'
import { Activity, Wifi, WifiOff, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import type { DeviceHealth } from '@/types'

interface DeviceCardProps {
  device: DeviceHealth
}

function DeviceCard({ device }: DeviceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusColor = (status: DeviceHealth['status']) => {
    switch (status) {
      case 'online': return 'bg-emerald-500'
      case 'warning': return 'bg-amber-500'
      case 'offline': return 'bg-destructive'
    }
  }

  const getStatusLabel = (status: DeviceHealth['status']) => {
    switch (status) {
      case 'online': return 'Trực tuyến'
      case 'warning': return 'Cảnh báo'
      case 'offline': return 'Ngoại tuyến'
    }
  }

  const getTypeBadgeColor = (type: DeviceHealth['type']) => {
    switch (type) {
      case 'sensor': return 'bg-blue-500/10 text-blue-500'
      case 'camera': return 'bg-purple-500/10 text-purple-500'
      case 'edge_node': return 'bg-cyan-500/10 text-cyan-500'
      case 'service': return 'bg-orange-500/10 text-orange-500'
    }
  }

  const getTypeLabel = (type: DeviceHealth['type']) => {
    switch (type) {
      case 'sensor': return 'Cảm biến'
      case 'camera': return 'Camera'
      case 'edge_node': return 'Edge Node'
      case 'service': return 'Dịch vụ'
    }
  }

  const getSignalBars = (rssi?: number) => {
    if (!rssi) return 0
    if (rssi >= -50) return 4
    if (rssi >= -60) return 3
    if (rssi >= -70) return 2
    if (rssi >= -80) return 1
    return 0
  }

  const signalBars = getSignalBars(device.rssi)

  const formatUptime = (hours?: number) => {
    if (!hours) return 'N/A'
    if (hours < 24) return `${hours.toFixed(1)} giờ`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days} ngày ${remainingHours.toFixed(0)} giờ`
  }

  const formatLastSeen = (timestamp?: string) => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div
      className={cn(
        'bg-card rounded-xl border border-border overflow-hidden',
        'transition-all duration-200 cursor-pointer',
        'hover:border-primary/50 hover:shadow-lg'
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Status Indicator */}
            <div className="relative">
              <div className={cn(
                'w-3 h-3 rounded-full',
                getStatusColor(device.status)
              )} />
              {device.status === 'online' && (
                <div className={cn(
                  'absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-75'
                )} />
              )}
              {device.status === 'warning' && (
                <div className={cn(
                  'absolute inset-0 w-3 h-3 rounded-full bg-amber-500 animate-pulse opacity-75'
                )} />
              )}
            </div>

            <div>
              <h3 className="font-medium text-foreground text-sm">{device.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  getTypeBadgeColor(device.type)
                )}>
                  {getTypeLabel(device.type)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getStatusLabel(device.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Signal Strength (WiFi) */}
          {device.rssi !== undefined && (
            <div className="flex items-center gap-1">
              <Wifi className={cn(
                'w-4 h-4',
                signalBars > 0 ? 'text-primary' : 'text-muted-foreground'
              )} />
              <div className="flex items-end gap-0.5 h-3">
                {[1, 2, 3, 4].map((bar) => (
                  <div
                    key={bar}
                    className={cn(
                      'w-1 rounded-sm transition-colors',
                      bar <= signalBars ? 'bg-primary' : 'bg-muted'
                    )}
                    style={{ height: `${bar * 25}%` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Expand indicator */}
        <div className="mt-3 flex items-center justify-center">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isExpanded ? 'max-h-40' : 'max-h-0'
        )}
      >
        <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/20">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {device.uptime_hours !== undefined && (
              <div>
                <p className="text-muted-foreground text-xs">Thời gian hoạt động</p>
                <p className="text-foreground font-medium">{formatUptime(device.uptime_hours)}</p>
              </div>
            )}
            {device.free_heap_mb !== undefined && (
              <div>
                <p className="text-muted-foreground text-xs">Bộ nhớ trống</p>
                <p className="text-foreground font-medium">{device.free_heap_mb} MB</p>
              </div>
            )}
            {device.rssi !== undefined && (
              <div>
                <p className="text-muted-foreground text-xs">RSSI</p>
                <p className="text-foreground font-medium">{device.rssi} dBm</p>
              </div>
            )}
            {device.last_seen !== undefined && (
              <div>
                <p className="text-muted-foreground text-xs">Lần cuối thấy</p>
                <p className="text-foreground font-medium text-xs">{formatLastSeen(device.last_seen)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DeviceHealthPage() {
  const { devices } = useApp()

  const onlineCount = devices.filter((d) => d.status === 'online').length
  const warningCount = devices.filter((d) => d.status === 'warning').length
  const offlineCount = devices.filter((d) => d.status === 'offline').length

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Tình trạng thiết bị
        </h1>
        <p className="text-muted-foreground mt-1">
          Giám sát trạng thái và kết nối của các thiết bị IoT
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{onlineCount}</p>
              <p className="text-sm text-muted-foreground">Đang hoạt động</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{warningCount}</p>
              <p className="text-sm text-muted-foreground">Cảnh báo</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{offlineCount}</p>
              <p className="text-sm text-muted-foreground">Ngoại tuyến</p>
            </div>
          </div>
        </div>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {devices.map((device) => (
          <DeviceCard key={device.device_id} device={device} />
        ))}
      </div>
    </div>
  )
}
