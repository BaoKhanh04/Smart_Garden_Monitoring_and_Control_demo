import { useState, useRef, useCallback, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { cn } from '@/lib/utils'
import {
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  FileText,
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Camera,
  Loader2,
  Check,
  Cpu
} from 'lucide-react'
import type { DiseaseScan } from '@/types'
import lacayImg from '@/assets/lacay.jpg'
import lacay1Img from '@/assets/lacay1.jpg'
import lacayheatmapImg from '@/assets/lacayheatmap.jpg'

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

  // Resolve scan image based on status
  const getScanImage = (scan: DiseaseScan | null) => {
    if (!scan) return lacayImg
    if (scan.status === 'Healthy') {
      return lacay1Img
    }
    return lacayImg
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

  const confidenceScore = selectedScan
    ? selectedScan.detections.length > 0
      ? selectedScan.detections[0].confidence
      : 98.6
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

      {/* Left/Center Column (Live Scan & Diagnostic Visualizer) */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        {/* Diagnostic Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">
              Xem chẩn đoán trực tiếp
            </h1>
            <p className="text-xs text-muted-foreground italic mt-0.5 font-mono">
              AI chẩn đoán bệnh lá cây cà chua
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

        {/* Live Scanner Viewport Card (Displaying active leaf) */}
        {selectedScan ? (
          <div className="relative aspect-video lg:aspect-auto lg:h-[450px] bg-slate-950/70 border border-border/60 rounded-2xl overflow-hidden flex items-center justify-center p-6 group">
            {/* Floating Pulsing Analyzing pathogens Box */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1 z-20 animate-pulse pointer-events-none select-none">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span className="text-[9px] font-bold text-emerald-400 tracking-wider font-mono">
                ĐANG PHÂN TÍCH LÁ...
              </span>
            </div>

            {/* Floating Left Sidebar Panel: Real Captures (Vertical Rich Details List) */}
            <div className="absolute left-4 top-16 bottom-4 w-28 bg-slate-950/75 border border-white/10 rounded-2xl p-2 flex flex-col gap-2 z-20 backdrop-blur-md items-center overflow-y-auto scrollbar-none shadow-lg">
              <div className="text-[8px] text-white/45 font-bold uppercase tracking-widest text-center border-b border-white/10 pb-1.5 w-full">
                Lịch sử quét
              </div>
              <div className="flex-1 w-full flex flex-col gap-2.5 pt-1.5">
                {diseaseScans.map((scan) => {
                  const isSelected = selectedScan.id === scan.id
                  const dateObj = new Date(scan.timestamp)
                  const formattedDate = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                  const formattedTime = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
                  const diseaseName = scan.status === 'Healthy' ? 'Bình thường' : scan.detections[0]?.class === 'Brown Spot' ? 'Đốm nâu' : 'Phấn trắng'
                  const confidenceVal = scan.status === 'Healthy' ? 98 : Math.round(scan.detections[0]?.confidence || 90)

                  return (
                    <button
                      key={scan.id}
                      onClick={() => {
                        setSelectedScan(scan)
                        resetView()
                      }}
                      className={cn(
                        "relative w-full rounded-xl p-1.5 border text-left transition-all duration-300 shrink-0 cursor-pointer flex flex-col gap-1",
                        isSelected
                          ? "bg-primary/20 border-[#00652c] ring-1 ring-[#00652c]/50 shadow-[0_0_6px_rgba(0,101,44,0.4)]"
                          : "bg-slate-950/40 border-white/5 hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center gap-1">
                        <Camera className="w-2.5 h-2.5 text-white/60 shrink-0" />
                        <span className="text-[7.5px] font-mono text-white/80 font-bold whitespace-nowrap">
                          {formattedDate} {formattedTime}
                        </span>
                      </div>
                      
                      <div className="flex gap-1 items-center">
                        <img src={getScanImage(scan)} className="w-5 h-5 rounded object-cover shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[8.5px] font-bold text-white truncate leading-tight">
                            {diseaseName}
                          </div>
                          <div className="text-[7.5px] font-bold text-emerald-400 font-mono leading-none mt-0.5">
                            {confidenceVal}%
                          </div>
                        </div>
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
              className="flex-1 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing relative flex items-center justify-center p-4 pl-32"
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

                {/* Main leaf scan image: resolved based on status */}
                <img
                  src={getScanImage(selectedScan)}
                  alt="Live diagnostics scan"
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                />

                {/* Relative Bounding Boxes & FOCUSED Heatmaps Overlay */}
                {showBboxes &&
                  selectedScan.detections.map((detection, index) => {
                    const [xMin, yMin, xMax, yMax] = detection.box
                    const left = (xMin / 800) * 100
                    const top = (yMin / 600) * 100
                    const width = ((xMax - xMin) / 800) * 100
                    const height = ((yMax - yMin) / 600) * 100

                    return (
                      <div key={index} className="absolute inset-0 pointer-events-none">
                        {/* Localized Heatmap Overlay focused on the bounding box */}
                        <div
                          className="absolute opacity-90 mix-blend-hard-light pointer-events-none filter blur-[6px] animate-pulse"
                          style={{
                            left: `${left - width * 0.3}%`,
                            top: `${top - height * 0.3}%`,
                            width: `${width * 1.6}%`,
                            height: `${height * 1.6}%`,
                            borderRadius: '40% 60% 50% 55% / 50% 45% 60% 50%',
                            background: 'radial-gradient(circle, rgba(239,68,68,0.95) 0%, rgba(245,158,11,0.85) 30%, rgba(34,197,94,0.5) 55%, rgba(59,130,246,0.2) 75%, transparent 90%)'
                          }}
                        />

                        {/* Bounding Box Outline */}
                        <div
                          className="absolute border border-red-500 bg-red-500/5 shadow-[0_0_6px_rgba(239,68,68,0.3)] rounded"
                          style={{
                            left: `${left}%`,
                            top: `${top}%`,
                            width: `${width}%`,
                            height: `${height}%`,
                          }}
                        >
                          <div className="absolute -top-5 left-0 bg-red-500 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded whitespace-nowrap shadow-md">
                            {getDiseaseVietnameseName(detection.class).toUpperCase()} {Math.round(detection.confidence)}%
                          </div>
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

        {/* AI Analysis Checklist */}
        <div className="bg-card border border-border/60 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
          <h3 className="text-[9px] font-bold text-muted-foreground font-mono tracking-widest uppercase">
            AI ANALYSIS STATUS
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-foreground font-sans">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <span className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[9px] shrink-0">✓</span>
              Đã phát hiện lá cây
            </div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <span className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[9px] shrink-0">✓</span>
              Đã xác định vùng bất thường
            </div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <span className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[9px] shrink-0">✓</span>
              Đã phân loại bệnh hại
            </div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <span className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[9px] shrink-0">✓</span>
              Đã đánh giá mức độ
            </div>
          </div>
        </div>

        {/* Pathogen Saliency Analysis Grid */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-heading font-bold text-foreground">
                Phân tích vùng bệnh
              </h2>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                Các giai đoạn phân tích đặc trưng của lá bệnh trong mô hình thị giác máy tính
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Stage 1: Ảnh gốc */}
            <div className="flex flex-col gap-2">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border/40 bg-slate-900 shadow-sm group">
                <img
                  src={getScanImage(selectedScan)}
                  alt="Ảnh gốc"
                  className="w-full h-full object-cover select-none group-hover:scale-105 transition-all duration-500"
                  draggable={false}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-center text-muted-foreground uppercase tracking-wider">Ảnh gốc</span>
            </div>

            {/* Stage 2: Bản đồ nhiệt */}
            <div className="flex flex-col gap-2">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border/40 bg-slate-900 shadow-sm group">
                <img
                  src={selectedScan?.status === 'Healthy' ? lacay1Img : lacayheatmapImg}
                  alt="Bản đồ nhiệt"
                  className="w-full h-full object-cover select-none group-hover:scale-105 transition-all duration-500"
                  draggable={false}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-center text-muted-foreground uppercase tracking-wider">Bản đồ nhiệt</span>
            </div>

            {/* Stage 3: Vùng bệnh */}
            <div className="flex flex-col gap-2">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border/40 bg-slate-900 shadow-sm group">
                <img
                  src={getScanImage(selectedScan)}
                  alt="Vùng bệnh"
                  className="w-full h-full object-cover select-none group-hover:scale-105 transition-all duration-500"
                  draggable={false}
                />
                {selectedScan && selectedScan.status === 'Diseased' && (
                  selectedScan.detections.map((det, i) => {
                    const [xMin, yMin, xMax, yMax] = det.box
                    const left = (xMin / 800) * 100
                    const top = (yMin / 600) * 100
                    const width = ((xMax - xMin) / 800) * 100
                    const height = ((yMax - yMin) / 600) * 100
                    return (
                      <div
                        key={i}
                        className="absolute border border-red-500 bg-red-500/10 shadow-[0_0_4px_rgba(239,68,68,0.3)] rounded"
                        style={{
                          left: `${left}%`,
                          top: `${top}%`,
                          width: `${width}%`,
                          height: `${height}%`
                        }}
                      />
                    )
                  })
                )}
              </div>
              <span className="text-[10px] font-mono font-bold text-center text-muted-foreground uppercase tracking-wider">Vùng nhận diện</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (AI Analysis Outcomes Sidebar) */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-heading font-bold text-foreground tracking-tight flex items-center gap-1.5">
            Phân tích thời gian thực
          </h2>
          <div className="flex items-center gap-1 mt-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
              AI VISION ANALYSIS
            </span>
          </div>
        </div>

        {/* Pathogen Diagnostic Alert Card */}
        {selectedScan && selectedScan.status === 'Diseased' ? (
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 flex flex-col gap-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
              <h3 className="text-xs font-bold font-mono tracking-wider uppercase">CẢNH BÁO BỆNH HẠI</h3>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-base font-bold text-foreground">
                {getDiseaseVietnameseName(selectedScan.detections[0]?.class)}
              </h4>
              <p className="text-[11px] text-muted-foreground italic font-mono leading-none">
                {getDiseaseScientificName(selectedScan.detections[0]?.class)}
              </p>
            </div>

            <div className="pt-2 border-t border-red-500/10 text-xs font-sans text-muted-foreground leading-relaxed">
              Hệ thống phát hiện phiến lá xuất hiện quầng úa vàng rộng, tập trung các đốm hoại tử màu nâu sẫm dạng vòng đồng tâm (tương tự hình bia bắn) đặc trưng của nấm Alternaria solani. Mép lá có dấu hiệu héo khô cháy bìa.
            </div>

            <div className="pt-2.5 border-t border-red-500/10 space-y-2.5 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Mức độ:</span>
                <span className="font-extrabold text-red-600 dark:text-red-400">CAO</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Độ tin cậy:</span>
                <span className="font-bold font-mono text-foreground">{confidenceScore.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Vùng ảnh hưởng:</span>
                <span className="font-bold text-foreground">{selectedScan.detections.length} vùng</span>
              </div>
            </div>

            <div className="pt-2 flex justify-start">
              <button
                onClick={() => setShowProtocolsModal(true)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-sm"
              >
                Xem phác đồ
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 flex flex-col gap-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <h3 className="text-xs font-bold font-mono tracking-wider uppercase">Chỉ số sinh học bình thường</h3>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-base font-bold text-foreground">
                Không phát hiện bệnh hại
              </h4>
              <p className="text-[11px] text-muted-foreground italic font-mono leading-none">
                Solanum lycopersicum
              </p>
            </div>

            <div className="pt-2 border-t border-emerald-500/10 text-xs font-sans text-muted-foreground leading-relaxed">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">AI Phân tích nông nghiệp:</span>
              Phiến lá có sắc tố xanh lục tự nhiên, phân bố gân lá đều đặn, không phát hiện quầng úa vàng hay đốm hoại tử nấm hại. Chỉ số sinh học hoàn toàn bình thường.
            </div>

            <div className="pt-2.5 border-t border-emerald-500/10 space-y-2.5 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Mức độ:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Không</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Độ tin cậy:</span>
                <span className="font-bold font-mono text-foreground">{confidenceScore.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Vùng ảnh hưởng:</span>
                <span className="font-bold text-foreground">0 vùng</span>
              </div>
            </div>

            <div className="pt-2 flex justify-start">
              <button
                onClick={() => setShowProtocolsModal(true)}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-sm"
              >
                Xem chẩn đoán
              </button>
            </div>
          </div>
        )}

        {/* Confidence Level Progress */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2.5">
          <div className="flex items-end justify-between">
            <span className="text-xs text-muted-foreground font-sans">Độ tin cậy</span>
            <span className="text-lg font-heading font-extrabold text-[#00652c] leading-none">
              {confidenceScore.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/20">
            <div
              className="h-full bg-[#00652c] rounded-full transition-all duration-500"
              style={{ width: `${confidenceScore}%` }}
            />
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
