import { useState, useRef, useCallback, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { cn } from '@/lib/utils'
import {
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Filter
} from 'lucide-react'
import type { DiseaseScan } from '@/types'

type FilterType = 'All' | 'Healthy' | 'Diseased'

export default function DiseaseDetectionPage() {
  const { diseaseScans } = useApp()
  const [selectedScan, setSelectedScan] = useState<DiseaseScan | null>(
    diseaseScans.length > 0 ? diseaseScans[0] : null
  )
  const [filter, setFilter] = useState<FilterType>('All')
  const [showBboxes, setShowBboxes] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const filteredScans = diseaseScans.filter((scan) => {
    if (filter === 'All') return true
    if (filter === 'Healthy') return scan.status === 'Healthy'
    if (filter === 'Diseased') return scan.status === 'Diseased'
    return true
  })

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)))
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    }
  }, [isPanning, panStart])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const resetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(3, prev + 0.2))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(0.5, prev - 0.2))
  }, [])

  useEffect(() => {
    if (diseaseScans.length > 0 && !selectedScan) {
      setSelectedScan(diseaseScans[0])
    }
  }, [diseaseScans, selectedScan])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDiseaseBadgeColor = (status: 'Healthy' | 'Diseased') => {
    return status === 'Healthy'
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      : 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  return (
    <div className="flex h-full gap-4">
      {/* Left Panel - Scan History List */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-card rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Lịch sử quét
          </h2>
          {/* Filter Dropdown */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="All">Tất cả</option>
              <option value="Healthy">Khỏe mạnh</option>
              <option value="Diseased">Bệnh</option>
            </select>
          </div>
        </div>

        {/* Scan List */}
        <div className="flex-1 overflow-y-auto">
          {filteredScans.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
              <AlertTriangle className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">Không có kết quả quét</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {filteredScans.map((scan) => (
                <button
                  key={scan.id}
                  onClick={() => {
                    setSelectedScan(scan)
                    resetView()
                  }}
                  className={cn(
                    'w-full p-3 rounded-lg border transition-all text-left',
                    selectedScan?.id === scan.id
                      ? 'bg-primary/10 border-primary/30'
                      : 'bg-background/50 border-border hover:bg-background hover:border-border/80'
                  )}
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                      <img
                        src={scan.image_url}
                        alt={`Scan ${scan.id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {/* Disease Badge */}
                      <span
                        className={cn(
                          'inline-block px-2 py-0.5 text-xs font-medium rounded-full border mb-1',
                          getDiseaseBadgeColor(scan.status)
                        )}
                      >
                        {scan.status === 'Healthy' ? 'Khỏe mạnh' : scan.detections[0]?.class || 'Bệnh'}
                      </span>

                      {/* Timestamp */}
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(scan.timestamp)}
                      </p>

                      {/* Detection Count */}
                      <p className="text-xs text-muted-foreground mt-1">
                        {scan.detections.length > 0
                          ? `${scan.detections.length} phát hiện`
                          : 'Không có bệnh'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Main Viewer */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedScan ? (
          <>
            {/* Image Viewer */}
            <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
              {/* Toolbar */}
              <div className="flex items-center justify-between p-3 border-b border-border bg-background/50">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full',
                      getDiseaseBadgeColor(selectedScan.status)
                    )}
                  >
                    {selectedScan.status === 'Healthy' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    {selectedScan.status}
                  </span>

                  {selectedScan.detections.length > 0 && (
                    <button
                      onClick={() => setShowBboxes(!showBboxes)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors',
                        showBboxes
                          ? 'bg-primary/20 border-primary/30 text-primary'
                          : 'bg-background border-border text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {showBboxes ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {showBboxes ? 'Ẩn' : 'Hiện'} khung
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={zoomOut}
                    className="p-2 rounded-lg bg-background border border-border hover:bg-muted transition-colors"
                    title="Thu nhỏ"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm text-muted-foreground">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={zoomIn}
                    className="p-2 rounded-lg bg-background border border-border hover:bg-muted transition-colors"
                    title="Phóng to"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={resetView}
                    className="p-2 rounded-lg bg-background border border-border hover:bg-muted transition-colors ml-2"
                    title="Đặt lại"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Image Container */}
              <div
                ref={imageContainerRef}
                className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing relative"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div
                  className="relative w-full h-full flex items-center justify-center"
                  style={{
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                    transformOrigin: 'center center',
                  }}
                >
                  {/* Main Image */}
                  <img
                    src={selectedScan.image_url}
                    alt="Disease scan"
                    className="max-w-full max-h-full object-contain select-none"
                    draggable={false}
                  />

                  {/* Bounding Box Overlays */}
                  {showBboxes &&
                    selectedScan.detections.map((detection, index) => {
                      const [xMin, yMin, xMax, yMax] = detection.box
                      const left = xMin
                      const top = yMin
                      const width = xMax - xMin
                      const height = yMax - yMin

                      return (
                        <div
                          key={index}
                          className="absolute border-2 border-dashed border-red-500 bg-red-500/10"
                          style={{
                            left: `${left}px`,
                            top: `${top}px`,
                            width: `${width}px`,
                            height: `${height}px`,
                          }}
                        >
                          {/* Label */}
                          <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-0.5 rounded-t whitespace-nowrap">
                            {detection.class} {Math.round(detection.confidence)}%
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>

            {/* AI Recommendation Card */}
            <div className="mt-4 p-4 bg-card rounded-xl border border-border">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">AI</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Khuyến nghị từ AI
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedScan.recommendation}
                  </p>

                  {selectedScan.detections.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">
                        Chi tiết phát hiện:
                      </h4>
                      <div className="space-y-2">
                        {selectedScan.detections.map((detection, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-foreground">{detection.class}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${detection.confidence}%` }}
                                />
                              </div>
                              <span className="text-muted-foreground text-xs w-12 text-right">
                                {detection.confidence}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-card rounded-xl border border-border">
            <AlertTriangle className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Chọn một kết quả quét để xem chi tiết</p>
          </div>
        )}
      </div>
    </div>
  )
}
