import { useState, useRef, useCallback, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { cn } from '@/lib/utils'
import {
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  FileText,
  Video,
  Activity,
  Cpu,
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Camera,
  Loader2,
  Check
} from 'lucide-react'
import type { DiseaseScan } from '@/types'
import lacayImg from '@/assets/lacay.jpg'

// Saliency Heatmap Scan Thumbnail Helper
interface SaliencyThumbnailProps {
  label: string
  gradientStyle?: string
  isPurple?: boolean
}

function SaliencyThumbnail({ label, gradientStyle, isPurple = true }: SaliencyThumbnailProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border/40 bg-slate-900 flex items-center justify-center group hover:border-emerald-500/30 transition-all duration-300 shadow-sm">
        {/* Base Leaf Image */}
        <img
          src={lacayImg}
          alt={label}
          className={cn(
            "w-full h-full object-cover select-none group-hover:scale-105 transition-all duration-500",
            isPurple ? "filter brightness-[0.85] contrast-[1.15] saturate-[1.8] hue-rotate-[220deg]" : ""
          )}
          draggable={false}
        />
        
        {/* Saliency Gradient Overlay */}
        {gradientStyle && (
          <div
            className="absolute inset-0 opacity-80 mix-blend-hard-light pointer-events-none transition-all duration-300 group-hover:opacity-90 animate-fade-in"
            style={{ background: gradientStyle }}
          />
        )}
      </div>
      <div className="text-center">
        <span className="text-[10px] font-mono font-bold text-muted-foreground block truncate uppercase tracking-wide">
          {label}
        </span>
      </div>
    </div>
  )
}

export default function DiseaseDetectionPage() {
  const { diseaseScans } = useApp()
  const [selectedScan, setSelectedScan] = useState<DiseaseScan | null>(
    diseaseScans.length > 0 ? diseaseScans[0] : null
  )
  const [showBboxes, setShowBboxes] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const imageContainerRef = useRef<HTMLDivElement>(null)

  // Report and Archive States
  const [reportGenerating, setReportGenerating] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showProtocolsModal, setShowProtocolsModal] = useState(false)

  // Zoom/Pan Functions
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

  useEffect(() => {
    if (diseaseScans.length > 0 && !selectedScan) {
      setSelectedScan(diseaseScans[0])
    }
  }, [diseaseScans, selectedScan])

  // Helpers
  const formatToTime = (timestampStr: string) => {
    const date = new Date(timestampStr)
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Dynamic coordinates mapping based on scan bounding box center
  const getCoordinates = (scan: DiseaseScan | null) => {
    if (scan && scan.detections.length > 0) {
      const [xMin, yMin, xMax, yMax] = scan.detections[0].box
      const x = ((xMin + xMax) / 2).toFixed(4)
      const y = ((yMin + yMax) / 2).toFixed(4)
      return { x, y }
    }
    return { x: '42.3487', y: '86.9601' }
  }

  // Dynamic cellular attributes mapping based on health status
  const getCellularAttributes = (scan: DiseaseScan | null) => {
    if (!scan) return { chlorophyll: '78%', turgor: 'BÌNH THƯỜNG', stomata: 'MỞ', nitrogen: '4.2%' }
    if (scan.status === 'Healthy') {
      return { chlorophyll: '82%', turgor: 'BÌNH THƯỜNG', stomata: 'MỞ', nitrogen: '4.5%' }
    }
    if (scan.detections[0]?.class === 'Brown Spot') {
      return { chlorophyll: '58%', turgor: 'THIẾU HỤT', stomata: 'HẠN CHẾ', nitrogen: '3.8%' }
    }
    // Powdery Mildew
    return { chlorophyll: '64%', turgor: 'BÌNH THƯỜNG', stomata: 'ĐÓNG', nitrogen: '4.0%' }
  }

  const getDiseaseScientificName = (diseaseClass: string) => {
    if (diseaseClass === 'Brown Spot') return 'Alternaria solani'
    if (diseaseClass === 'Powdery Mildew') return 'Podosphaera xanthii'
    return 'Solanum lycopersicum'
  }

  const getDiseaseVietnameseName = (diseaseClass: string) => {
    if (diseaseClass === 'Brown Spot') return 'Bệnh đốm nâu (Early Blight)'
    if (diseaseClass === 'Powdery Mildew') return 'Bệnh phấn trắng (Powdery Mildew)'
    return 'Cây khỏe mạnh'
  }

  // Mock report generation trigger
  const handleGenerateReport = () => {
    setReportGenerating(true)
    setTimeout(() => {
      setReportGenerating(false)
      setToastMessage('Báo cáo phân tích đã được tạo thành công!')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }, 1500)
  }

  // Mock archive result trigger
  const handleArchiveResult = () => {
    setArchiving(true)
    setTimeout(() => {
      setArchiving(false)
      setToastMessage('Kết quả quét đã được lưu trữ thành công!')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }, 1200)
  }

  const coordinates = getCoordinates(selectedScan)
  const cellAttrs = getCellularAttributes(selectedScan)
  const confidenceScore = selectedScan
    ? selectedScan.detections.length > 0
      ? selectedScan.detections[0].confidence
      : 99.4
    : 0

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full text-foreground relative">
      {/* Toast Notification */}
      <div
        className={cn(
          'fixed top-20 right-8 z-50 px-4 py-3 rounded-xl bg-primary text-primary-foreground shadow-lg',
          'flex items-center gap-2 font-medium transition-all duration-300 border border-primary/20',
          showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        )}
      >
        <Check className="w-4 h-4" />
        <span className="text-sm font-sans">{toastMessage}</span>
      </div>

      {/* Protocols Dialog Modal */}
      {showProtocolsModal && selectedScan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border p-6 rounded-2xl max-w-md w-full shadow-2xl animate-slide-down">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold text-foreground">
                  Khuyến nghị & Phác đồ điều trị
                </h3>
                <p className="text-xs text-muted-foreground italic font-mono mt-0.5">
                  {selectedScan.status === 'Diseased'
                    ? `${getDiseaseVietnameseName(selectedScan.detections[0]?.class)} (${getDiseaseScientificName(selectedScan.detections[0]?.class)})`
                    : 'Solanum lycopersicum (Khỏe mạnh)'}
                </p>
              </div>
            </div>
            
            <div className="bg-background/50 rounded-xl p-4 border border-border/60 text-sm leading-relaxed text-muted-foreground font-sans">
              {selectedScan.recommendation}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowProtocolsModal(false)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styled Laser Scan Animation Sheet */}
      <style>{`
        @keyframes laserScan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .laser-scan-line {
          animation: laserScan 5s linear infinite;
        }
      `}</style>

      {/* Left Column (Live Scan & Diagnostic Visualizer) */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        {/* Diagnostic Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">
              Xem chẩn đoán trực tiếp
            </h1>
            <p className="text-xs text-muted-foreground italic mt-0.5 font-mono">
              Phân tích phổ thời gian thực của Solanum lycopersicum
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold font-mono tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
              ĐANG QUÉT
            </span>
            <span className="inline-flex items-center px-3 py-1 text-[10px] font-bold font-mono tracking-wider text-muted-foreground bg-muted border border-border/80 rounded-full">
              TRẠM: FS-07-ALPH
            </span>
          </div>
        </div>

        {/* Live Scanner Viewport Card (Displaying lacay.jpg) */}
        {selectedScan ? (
          <div className="relative aspect-video lg:aspect-auto lg:h-[450px] bg-slate-950/70 border border-border/60 rounded-2xl overflow-hidden flex items-center justify-center p-6 group">
            {/* Floating Top-Left Target Coordinates Box */}
            <div className="absolute top-4 left-4 bg-slate-950/75 border border-white/10 rounded-xl p-2.5 text-left pointer-events-none select-none z-20 backdrop-blur-md shadow-lg">
              <div className="text-[9px] text-white/40 font-mono font-bold uppercase tracking-wider">Tọa độ mục tiêu</div>
              <div className="text-xs text-white/90 font-mono mt-0.5">X: {coordinates.x}</div>
              <div className="text-xs text-white/90 font-mono">Y: {coordinates.y}</div>
            </div>

            {/* Floating Pulsing Analyzing pathogens Box */}
            <div className="absolute top-20 left-4 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1 z-20 animate-pulse pointer-events-none select-none">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span className="text-[9px] font-bold text-emerald-400 tracking-wider font-mono">
                ĐANG PHÂN TÍCH MẦM BỆNH...
              </span>
            </div>

            {/* Floating Left Sidebar Panel: Real Captures (Vertical Thumbnails List) */}
            <div className="absolute left-4 top-32 bottom-4 w-20 bg-slate-950/75 border border-white/10 rounded-2xl p-2 flex flex-col gap-2 z-20 backdrop-blur-md items-center overflow-y-auto scrollbar-none shadow-lg">
              <div className="text-[8px] text-white/45 font-bold uppercase tracking-widest text-center border-b border-white/10 pb-1.5 w-full">
                Ảnh chụp
              </div>
              <div className="flex-1 w-full flex flex-col gap-2 pt-1.5">
                {diseaseScans.map((scan) => {
                  const isSelected = selectedScan.id === scan.id
                  return (
                    <button
                      key={scan.id}
                      onClick={() => {
                        setSelectedScan(scan)
                        resetView()
                      }}
                      className={cn(
                        "relative w-16 h-16 rounded-lg overflow-hidden border transition-all duration-300 shrink-0 cursor-pointer",
                        isSelected
                          ? "border-[#00652c] ring-2 ring-[#00652c]/50 shadow-[0_0_8px_rgba(0,101,44,0.5)] scale-102"
                          : "border-white/10 hover:border-white/30"
                      )}
                    >
                      <img src={lacayImg} alt="thumbnail" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      <div className="absolute bottom-1 left-0 right-0 flex items-center justify-between px-1 text-[8px] font-semibold text-white/90">
                        <Camera className="w-2.5 h-2.5 opacity-80" />
                        <span>{formatToTime(scan.timestamp)}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Floating Bottom-Right Toolbar Buttons */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
              <button
                onClick={() => setShowBboxes(!showBboxes)}
                className={cn(
                  "p-2.5 rounded-xl border text-white transition-all duration-300 backdrop-blur-md shadow-lg cursor-pointer",
                  showBboxes
                    ? "bg-[#00652c]/30 border-[#00652c]/40 text-[#4ade80]"
                    : "bg-slate-900/60 border-white/15 hover:bg-slate-900/80"
                )}
                title={showBboxes ? "Ẩn khung phân tích" : "Hiện khung phân tích"}
              >
                {showBboxes ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              
              <button
                onClick={resetView}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-white/15 hover:bg-slate-900/80 text-white transition-all duration-300 backdrop-blur-md shadow-lg cursor-pointer"
                title="Đặt lại góc quay"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Zoomable Image Container */}
            <div
              ref={imageContainerRef}
              className="flex-1 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing relative flex items-center justify-center p-4"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div
                className="relative aspect-[4/3] max-h-full max-w-full flex items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-slate-900/20"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transformOrigin: 'center center',
                  transition: isPanning ? 'none' : 'transform 0.15s ease-out',
                }}
              >
                {/* Laser scan line overlay within image container */}
                <div className="absolute left-0 right-0 h-[1.5px] bg-teal-400/80 shadow-[0_0_8px_rgba(45,212,191,0.7)] z-10 pointer-events-none laser-scan-line" />

                {/* Main leaf scan image: assets/lacay.jpg */}
                <img
                  src={lacayImg}
                  alt="Live diagnostics scan"
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                />

                {/* Relative Bounding Boxes Overlay */}
                {showBboxes &&
                  selectedScan.detections.map((detection, index) => {
                    const [xMin, yMin, xMax, yMax] = detection.box
                    const left = (xMin / 800) * 100
                    const top = (yMin / 600) * 100
                    const width = ((xMax - xMin) / 800) * 100
                    const height = ((yMax - yMin) / 600) * 100

                    return (
                      <div
                        key={index}
                        className="absolute border border-red-500 bg-red-500/10 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                        style={{
                          left: `${left}%`,
                          top: `${top}%`,
                          width: `${width}%`,
                          height: `${height}%`,
                        }}
                      >
                        {/* Technical marker style bounding box label */}
                        <div className="absolute -top-5 left-0 bg-red-500 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded whitespace-nowrap shadow-md">
                          {detection.class.toUpperCase()} {Math.round(detection.confidence)}%
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-card border border-border/60 rounded-2xl py-20">
            <AlertTriangle className="w-12 h-12 text-muted-foreground/40 mb-3 animate-pulse" />
            <p className="text-muted-foreground text-sm font-sans">Chọn một kết quả quét ở cột bên để xem chi tiết</p>
          </div>
        )}

        {/* Heatmap Scan (Saliency Map Grid) */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-heading font-bold text-foreground">
                Quét bản đồ nhiệt (Heatmap Scan)
              </h2>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                Bản đồ kích hoạt mạng nơ-ron (So sánh độ nhạy giữa các mô hình AI)
              </p>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            {/* Captured image */}
            <SaliencyThumbnail label="Ảnh đã chụp" isPurple={false} />

            {/* MobileNetV2 */}
            <SaliencyThumbnail
              label="MobileNetV2"
              isPurple={true}
              gradientStyle="radial-gradient(circle at 50% 100%, rgba(239,68,68,0.95) 0%, rgba(245,158,11,0.85) 20%, rgba(16,185,129,0.7) 40%, rgba(59,130,246,0.5) 60%, transparent 85%)"
            />

            {/* NasNetMobile */}
            <SaliencyThumbnail
              label="NasNetMobile"
              isPurple={true}
              gradientStyle="radial-gradient(circle at 65% 55%, rgba(239,68,68,0.95) 0%, rgba(245,158,11,0.85) 25%, rgba(16,185,129,0.7) 50%, rgba(59,130,246,0.4) 70%, transparent 90%)"
            />

            {/* Xception */}
            <SaliencyThumbnail
              label="Xception"
              isPurple={true}
              gradientStyle="radial-gradient(circle at 50% 50%, rgba(239,68,68,0.95) 0%, rgba(245,158,11,0.85) 20%, rgba(16,185,129,0.7) 40%, rgba(59,130,246,0.4) 60%, transparent 80%)"
            />

            {/* MobileNetV3 */}
            <SaliencyThumbnail
              label="MobileNetV3"
              isPurple={true}
              gradientStyle="radial-gradient(circle at 20% 25%, rgba(239,68,68,0.9) 0%, rgba(245,158,11,0.75) 25%, rgba(16,185,129,0.6) 45%, rgba(59,130,246,0.4) 65%, transparent 85%)"
            />
          </div>
        </div>
      </div>

      {/* Right Column (Real-time AI Analysis Dashboard Sidebar) */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-heading font-bold text-foreground tracking-tight flex items-center gap-1.5">
            Phân tích thời gian thực
          </h2>
          <div className="flex items-center gap-1 mt-1 font-mono">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
              AI ENGINE V4.2.0-ỔN ĐỊNH
            </span>
          </div>
        </div>

        {/* Pathogen Diagnostic Alert Card */}
        {selectedScan && selectedScan.status === 'Diseased' ? (
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex flex-col gap-3.5 shadow-[0_4px_12px_rgba(239,68,68,0.03)]">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <h3 className="text-xs font-bold font-mono tracking-wider uppercase">Cảnh báo bệnh hại</h3>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                {getDiseaseVietnameseName(selectedScan.detections[0]?.class)}
              </h4>
              <p className="text-[11px] text-muted-foreground italic mt-0.5 font-mono">
                {getDiseaseScientificName(selectedScan.detections[0]?.class)}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-red-500/10 text-xs mt-1">
              <span className="font-bold text-red-600 dark:text-red-400">Mức độ: Cao</span>
              <button
                onClick={() => setShowProtocolsModal(true)}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer transition-colors"
              >
                Xem phác đồ
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex flex-col gap-3.5 shadow-[0_4px_12px_rgba(16,185,129,0.03)]">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <h3 className="text-xs font-bold font-mono tracking-wider uppercase">Chỉ số sinh học bình thường</h3>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Không phát hiện bệnh hại
              </h4>
              <p className="text-[11px] text-muted-foreground italic mt-0.5 font-mono">
                Solanum lycopersicum
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-emerald-500/10 text-xs mt-1">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Mức độ: Không</span>
              <button
                onClick={() => setShowProtocolsModal(true)}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer transition-colors"
              >
                Xem phác đồ
              </button>
            </div>
          </div>
        )}

        {/* Confidence Level Progress */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2.5">
          <div className="flex items-end justify-between">
            <span className="text-xs text-muted-foreground font-sans">Độ tin cậy</span>
            <span className="text-lg font-heading font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">
              {confidenceScore.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/20">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${confidenceScore}%` }}
            />
          </div>
        </div>

        {/* Compute & Processing Metrics Grid */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 py-4 border-t border-b border-border/80">
          <div>
            <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Độ trễ tính toán</div>
            <div className="text-sm font-semibold font-mono text-foreground mt-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-muted-foreground" />
              43ms
            </div>
          </div>
          
          <div>
            <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Mô hình xử lý</div>
            <div className="text-sm font-semibold font-mono text-foreground mt-1 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
              R-Forest v4.2
            </div>
          </div>

          <div>
            <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Đồng bộ luồng</div>
            <div className="text-sm font-semibold font-mono text-foreground mt-1 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-muted-foreground" />
              60 FPS
            </div>
          </div>

          <div>
            <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Ống kính Camera</div>
            <div className="text-sm font-semibold font-mono text-foreground mt-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
              4K Spectral
            </div>
          </div>
        </div>

        {/* Cellular Attributes Section */}
        <div className="flex flex-col gap-3">
          <h3 className="text-[10px] font-bold text-muted-foreground font-mono tracking-widest uppercase">
            CHỈ SỐ TẾ BÀO (CELLULAR ATTRIBUTES)
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex px-2.5 py-1 text-[10px] font-mono font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 rounded">
              DIỆP LỤC: {cellAttrs.chlorophyll}
            </span>
            <span className="inline-flex px-2.5 py-1 text-[10px] font-mono font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 rounded">
              ĐỘ TRƯƠNG NƯỚC: {cellAttrs.turgor}
            </span>
            <span className="inline-flex px-2.5 py-1 text-[10px] font-mono font-bold bg-muted text-muted-foreground border border-border/80 rounded">
              KHÍ KHỔNG: {cellAttrs.stomata}
            </span>
            <span className="inline-flex px-2.5 py-1 text-[10px] font-mono font-bold bg-muted text-muted-foreground border border-border/80 rounded">
              NỒNG ĐỘ ĐẠM: {cellAttrs.nitrogen}
            </span>
          </div>
        </div>

        {/* Bottom Call Actions */}
        <div className="mt-2 flex flex-col gap-2.5">
          <button
            onClick={handleGenerateReport}
            disabled={reportGenerating}
            className="w-full py-2.5 bg-[#00652c] hover:bg-[#005323] active:bg-[#00421c] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {reportGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            {reportGenerating ? 'Đang tạo báo cáo...' : 'Xuất báo cáo'}
          </button>
          
          <button
            onClick={handleArchiveResult}
            disabled={archiving}
            className="w-full py-2.5 bg-card hover:bg-muted border border-border/80 text-foreground rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {archiving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Layers className="w-3.5 h-3.5" />
            )}
            {archiving ? 'Đang lưu trữ...' : 'Lưu trữ kết quả'}
          </button>
        </div>
      </div>
    </div>
  )
}
