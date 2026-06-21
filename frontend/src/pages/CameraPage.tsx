import { useState } from 'react'
import { Camera, Moon, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Snapshot {
  id: string
  imageUrl: string
  timestamp: string
}

export default function CameraPage() {
  const [isIrMode, setIsIrMode] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [isFlashing, setIsFlashing] = useState(false)
  const [snapshots, setSnapshots] = useState<Snapshot[]>([
    { id: 'snap_1', imageUrl: 'https://picsum.photos/id/1074/400/300', timestamp: '2026-06-21T08:45:00Z' },
    { id: 'snap_2', imageUrl: 'https://picsum.photos/id/1075/400/300', timestamp: '2026-06-21T08:40:00Z' },
    { id: 'snap_3', imageUrl: 'https://picsum.photos/id/1076/400/300', timestamp: '2026-06-21T08:35:00Z' },
    { id: 'snap_4', imageUrl: 'https://picsum.photos/id/1077/400/300', timestamp: '2026-06-21T08:30:00Z' },
    { id: 'snap_5', imageUrl: 'https://picsum.photos/id/1078/400/300', timestamp: '2026-06-21T08:25:00Z' },
  ])
  const [imageRefresh, setImageRefresh] = useState(1084)

  const handleSnapshot = () => {
    setIsFlashing(true)
    setTimeout(() => setIsFlashing(false), 200)

    const newSnapshot: Snapshot = {
      id: `snap_${Date.now()}`,
      imageUrl: `https://picsum.photos/id/${imageRefresh}/800/600`,
      timestamp: new Date().toISOString(),
    }

    setSnapshots(prev => [newSnapshot, ...prev.slice(0, 4)])
    setImageRefresh(prev => prev + 1)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Camera trực tiếp
          </h1>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-sm font-semibold text-red-400 uppercase tracking-wide">
              LIVE
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsOffline(!isOffline)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            isOffline
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-card text-muted-foreground border border-border hover:bg-accent'
          )}
        >
          {isOffline ? 'Offline' : 'Online'}
        </button>
      </div>

      {/* Video Area */}
      <div className={cn(
        'aspect-video rounded-xl overflow-hidden relative',
        isOffline ? 'bg-black' : 'bg-zinc-900'
      )}>
        {isOffline ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <WifiOff className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">Camera tạm thời mất kết nối...</p>
            <p className="text-sm opacity-70">Vui lòng kiểm tra kết nối mạng</p>
          </div>
        ) : (
          <>
            <img
              src={`https://picsum.photos/id/${imageRefresh}/1280/720`}
              alt="Camera feed"
              className={cn(
                'w-full h-full object-cover',
                isIrMode && 'grayscale sepia-[0.2] hue-rotate-180'
              )}
            />

            {/* IR Mode Badge */}
            {isIrMode && (
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-purple-500/90 text-white text-sm font-medium shadow-lg">
                Chế độ hồng ngoại
              </div>
            )}

            {/* Flash Effect */}
            {isFlashing && (
              <div className="absolute inset-0 bg-white animate-camera-flash pointer-events-none" />
            )}
          </>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-4">
          {/* Snapshot Button */}
          <button
            onClick={handleSnapshot}
            disabled={isOffline}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Camera className="w-5 h-5" />
            <span>Chụp ảnh</span>
          </button>

          {/* IR Mode Toggle */}
          <button
            onClick={() => setIsIrMode(!isIrMode)}
            disabled={isOffline}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all border',
              isIrMode
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                : 'bg-transparent border-border text-muted-foreground hover:bg-accent hover:text-foreground',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Moon className="w-5 h-5" />
            <span>Chế độ hồng ngoại</span>
          </button>
        </div>

        {/* Screenshot Count */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Camera className="w-4 h-4" />
          <span className="text-sm">
            <span className="font-semibold text-foreground">{snapshots.length}</span> ảnh đã chụp
          </span>
        </div>
      </div>

      {/* Recent Snapshots Strip */}
      <div className="space-y-3">
        <h2 className="text-lg font-heading font-semibold text-foreground">
          Ảnh chụp gần đây
        </h2>
        {snapshots.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
            <Camera className="w-8 h-8 mr-3 opacity-50" />
            <span>Chưa có ảnh nào được chụp</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                className="aspect-video rounded-lg overflow-hidden bg-card border border-border group relative"
              >
                <img
                  src={snapshot.imageUrl}
                  alt="Snapshot"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-xs text-white font-medium">
                      {formatTime(snapshot.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
