import { useState, useMemo } from 'react'
import {
  Brain,
  Clock,
  CloudRain,
  Droplets,
  Cpu,
  Check,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Loader2,
  Layers
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HistoryEntry {
  id: string
  time: string
  prediction: string
  moisture: string
  temp: string
  status: 'HOÀN THÀNH' | 'AUTO-SKIP' | 'HOÃN TƯỚI'
}

export default function AIIrrigationPage() {
  // Static environmental constants matching code.html
  const soilMoisture = 28
  const airTemp = 32
  const lightIntensity = 8500
  const rainChance = 5

  // UI state
  const [isActivating, setIsActivating] = useState<boolean>(false)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [showToast, setShowToast] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string>('')

  // Prediction History list state
  const [history, setHistory] = useState<HistoryEntry[]>([
    { id: 'h_1', time: 'Hôm nay, 08:30', prediction: '15 phút', moisture: '28%', temp: '32°C', status: 'HOÀN THÀNH' },
    { id: 'h_2', time: '24/05, 17:00', prediction: '10 phút', moisture: '35%', temp: '29°C', status: 'HOÀN THÀNH' },
    { id: 'h_3', time: '24/05, 08:00', prediction: 'Bỏ qua', moisture: '65%', temp: '24°C', status: 'AUTO-SKIP' },
    { id: 'h_4', time: '23/05, 16:45', prediction: '20 phút', moisture: '22%', temp: '34°C', status: 'HOÀN THÀNH' }
  ])

  // AI suggestion outcomes based on constants
  const aiDecision = useMemo(() => {
    return {
      type: 'WATER',
      title: 'Tưới 15 phút',
      reason: `Dựa trên độ ẩm đất thấp (28%) và nhiệt độ cao (32°C). Thuật toán tối ưu hóa để bù đắp sự thoát hơi nước nhanh chóng trong điều kiện ánh sáng mạnh.`,
      duration: 15,
      statusLabel: 'HOÀN THÀNH' as const
    }
  }, [])

  // Feature Importance weights matching code.html
  const featureWeights = {
    soil: 45,
    temp: 30,
    light: 15,
    rain: 10
  }

  // Refresh trigger (simulated metrics refresh)
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setToastMessage('Đã làm mới dữ liệu cảm biến thành công!')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2000)
    }, 800)
  }

  // Activate recommended action
  const handleActivate = () => {
    setIsActivating(true)
    setTimeout(() => {
      setIsActivating(false)

      // Get current hours:minutes
      const now = new Date()
      const timeStr = `Hôm nay, ${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`

      // Add to history
      const newEntry: HistoryEntry = {
        id: `h_${Date.now()}`,
        time: timeStr,
        prediction: '15 phút',
        moisture: '28%',
        temp: '32°C',
        status: 'HOÀN THÀNH'
      }

      setHistory(prev => [newEntry, ...prev])
      setToastMessage(`Đã kích hoạt hành động "${aiDecision.title}" thành công!`)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }, 1200)
  }

  return (
    <div className="flex flex-col min-h-0 text-foreground relative">
      {/* Toast alert */}
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

      {/* Header bar */}
      <div className="border-b border-border/60 pb-5 mb-6 flex flex-wrap justify-between items-end gap-4">
        <div className="space-y-1.5">
          <h2 className="text-3xl font-black font-heading text-foreground tracking-tight">
            Lên lịch tưới nước bằng AI
          </h2>
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
            <span className="flex items-center gap-1">
              <Brain className="w-3.5 h-3.5 text-primary shrink-0" />
              Mô hình Random Forest v4.2
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-border" />
            <span className="text-primary font-medium italic">Cập nhật lần cuối: vừa xong</span>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:bg-muted text-foreground text-xs font-bold transition-all cursor-pointer disabled:opacity-70"
        >
          {isRefreshing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RotateCcw className="w-3.5 h-3.5" />
          )}
          Làm mới dữ liệu
        </button>
      </div>

      <div className="space-y-6">
        {/* Top Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Model Status Card */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider text-muted-foreground">Trạng thái mô hình AI</h3>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  ONLINE
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1.5">
                <span className="text-4xl font-extrabold font-heading text-primary">98.4%</span>
                <span className="text-[10px] text-muted-foreground font-semibold">Độ chính xác</span>
              </div>
              <p className="text-xs text-muted-foreground">Mô hình vận hành ổn định trên 128 điểm dữ liệu sensor.</p>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-[10px] font-semibold text-muted-foreground font-mono">
                <span>Huấn luyện lần cuối:</span>
                <span className="text-foreground">Hôm nay, 04:15</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/20">
                <div className="h-full bg-primary rounded-full" style={{ width: '98.4%' }}></div>
              </div>
            </div>
          </div>

          {/* AI Recommendation Hero Card (Large - Spans 2 cols) */}
          <div className="lg:col-span-2 bg-[#00652c] text-white border border-[#00652c]/20 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-[#00652c]/10">
            {/* Shimmer decoration overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite] pointer-events-none" style={{ backgroundSize: '200% 100%' }} />

            <div>
              <h3 className="text-[11px] font-bold font-mono uppercase tracking-wider text-white/70 mb-3">Đề xuất tưới hiện tại</h3>
              <div className="flex flex-col gap-1.5">
                <span className="text-4xl font-extrabold font-heading tracking-tight">
                  {aiDecision.title}
                </span>
                <p className="text-xs leading-relaxed max-w-xl text-white/80 font-sans font-medium">
                  {aiDecision.reason}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 mt-6">
              <button
                onClick={handleActivate}
                disabled={isActivating}
                className="px-5 py-2.5 rounded-xl bg-white text-[#00652c] hover:bg-slate-50 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-75"
              >
                {isActivating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Kích hoạt ngay
              </button>
              <button
                onClick={() => {
                  setToastMessage('Đã thêm đề xuất vào hàng đợi đặt lịch tưới!')
                  setShowToast(true)
                  setTimeout(() => setShowToast(false), 2000)
                }}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-sm transition-all border border-white/15 cursor-pointer"
              >
                Đặt lịch sau
              </button>
            </div>
          </div>
        </div>

        {/* Middle Section: Inputs and Feature Importance */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column: Model Inputs (Takes 5/12) */}
          <div className="xl:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-heading text-foreground">
                Thông số môi trường thực tế
              </h3>
              <span className="text-[9px] font-bold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                Cập nhật thời gian thực
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {/* Moisture */}
              <div className="p-4 rounded-xl bg-card border border-border/80 hover:border-primary/30 transition-all group shadow-sm flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-foreground">Độ ẩm đất</span>
                  </div>
                  <span className="text-base font-extrabold font-heading text-primary">{soilMoisture}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border/10">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${soilMoisture}%` }} />
                </div>
              </div>

              {/* Temperature */}
              <div className="p-4 rounded-xl bg-card border border-border/80 hover:border-primary/30 transition-all group shadow-sm flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-destructive group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-foreground">Nhiệt độ không khí</span>
                  </div>
                  <span className="text-base font-extrabold font-heading text-foreground">{airTemp}°C</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border/10">
                  <div className="h-full bg-destructive rounded-full" style={{ width: '70%' }} />
                </div>
              </div>

              {/* Light Intensity */}
              <div className="p-4 rounded-xl bg-card border border-border/80 hover:border-primary/30 transition-all group shadow-sm flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-foreground">Cường độ ánh sáng</span>
                  </div>
                  <span className="text-base font-extrabold font-heading text-foreground">{lightIntensity} lux</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border/10">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              {/* Rain Forecast */}
              <div className="p-4 rounded-xl bg-card border border-border/80 hover:border-primary/30 transition-all group shadow-sm flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-foreground">Dự báo mưa</span>
                  </div>
                  <span className="text-base font-extrabold font-heading text-foreground">{rainChance}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border/10">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${rainChance}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Feature Importance (Takes 7/12) */}
          <div className="xl:col-span-7 flex flex-col gap-4">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-5 shadow-sm h-full">
              <h3 className="text-sm font-bold font-heading text-foreground">Tầm quan trọng của tham số</h3>
              
              <div className="space-y-4">
                {/* Soil Moisture */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    <span>Độ ẩm đất</span>
                    <span className="text-primary">{featureWeights.soil}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/20">
                    <div className="h-full bg-primary rounded-full relative" style={{ width: `${featureWeights.soil}%` }}>
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)] bg-[size:200%_100%] animate-[shimmer_2s_infinite]" />
                    </div>
                  </div>
                </div>

                {/* Temperature */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    <span>Nhiệt độ</span>
                    <span className="text-primary/80">{featureWeights.temp}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/20">
                    <div className="h-full bg-primary/75 rounded-full animate-pulse" style={{ width: `${featureWeights.temp}%` }} />
                  </div>
                </div>

                {/* Light */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    <span>Cường độ sáng</span>
                    <span className="text-primary/60">{featureWeights.light}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/20">
                    <div className="h-full bg-primary/50 rounded-full" style={{ width: `${featureWeights.light}%` }} />
                  </div>
                </div>

                {/* Rain forecast */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                    <span>Dự báo mưa</span>
                    <span className="text-primary/40">{featureWeights.rain}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/20">
                    <div className="h-full bg-primary/30 rounded-full" style={{ width: `${featureWeights.rain}%` }} />
                  </div>
                </div>
              </div>

              {/* Shimmer animation keyframes */}
              <style>{`
                @keyframes shimmer {
                  0% { background-position: 200% 0; }
                  100% { background-position: -200% 0; }
                }
              `}</style>
            </div>
          </div>
        </div>

        {/* Prediction History Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border/60 flex items-center justify-between">
            <h3 className="text-sm font-bold font-heading text-foreground">Lịch sử dự đoán gần nhất</h3>
            <button
              onClick={() => {
                setToastMessage('Tính năng lưu trữ chi tiết đang được đồng bộ!')
                setShowToast(true)
                setTimeout(() => setShowToast(false), 2000)
              }}
              className="text-primary text-xs font-bold hover:underline cursor-pointer"
            >
              Xem tất cả
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-[10px] uppercase tracking-wider font-mono border-b border-border/50">
                  <th className="px-6 py-3">Thời gian</th>
                  <th className="px-6 py-3">Dự đoán AI</th>
                  <th className="px-6 py-3">Độ ẩm TB</th>
                  <th className="px-6 py-3">Nhiệt độ TB</th>
                  <th className="px-6 py-3 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {history.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-foreground">{entry.time}</td>
                    <td className="px-6 py-4 text-xs font-bold text-primary">{entry.prediction}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">{entry.moisture}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">{entry.temp}</td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[9px] font-bold border',
                          entry.status === 'HOÀN THÀNH' && 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
                          entry.status === 'AUTO-SKIP' && 'bg-slate-500/10 border-slate-500/20 text-muted-foreground',
                          entry.status === 'HOÃN TƯỚI' && 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                        )}
                      >
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Footer copyright */}
      <footer className="mt-8 pt-4 pb-2 text-center border-t border-border/40 text-muted-foreground text-[10px] font-mono">
        © 2026 SGMC Agricultural Technology Solution. Tất cả các mô hình AI đều tuân thủ chuẩn ISO/IEC 42001.
      </footer>
    </div>
  )
}
