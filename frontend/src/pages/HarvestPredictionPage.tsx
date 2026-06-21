import { useApp } from '@/contexts/AppContext'
import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, Calendar, Scale } from 'lucide-react'

const GROWTH_STAGES_VI = [
  { key: 'germination', label: 'Nảy mầm' },
  { key: 'leafing', label: 'Ra lá' },
  { key: 'flowering', label: 'Ra hoa' },
  { key: 'fruiting', label: 'Đậu quả' },
  { key: 'ripening', label: 'Chín' },
]

const CONFIDENCE_CONFIG = {
  high: { label: 'Cao', bgClass: 'bg-emerald-500/20', textClass: 'text-emerald-400', borderClass: 'border-emerald-500/30' },
  medium: { label: 'Trung bình', bgClass: 'bg-amber-500/20', textClass: 'text-amber-400', borderClass: 'border-amber-500/30' },
  low: { label: 'Thấp', bgClass: 'bg-red-500/20', textClass: 'text-red-400', borderClass: 'border-red-500/30' },
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function HarvestPredictionPage() {
  const { harvestPrediction, activeGarden } = useApp()

  if (!harvestPrediction) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Calendar className="w-12 h-12 mb-4 opacity-50" />
        <p>Chưa có dữ liệu dự đoán thu hoạch</p>
      </div>
    )
  }

  const confidence = CONFIDENCE_CONFIG[harvestPrediction.confidence]
  const allStages = [...harvestPrediction.growth_stages_completed, ...harvestPrediction.growth_stages_remaining]
  const currentStageIndex = harvestPrediction.growth_stages_completed.length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Dự đoán thu hoạch</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Theo dõi tiến độ sinh trưởng và dự kiến ngày thu hoạch
        </p>
      </div>

      {/* Countdown Card */}
      <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
        <div className="mb-4">
          <p className="text-muted-foreground text-sm uppercase tracking-wider">
            {activeGarden?.name} • {harvestPrediction.crop_type}
          </p>
        </div>

        <div className="mb-6">
          <p className="text-muted-foreground text-sm mb-2">Còn khoảng</p>
          <div className="text-5xl font-bold text-primary tracking-tight">
            {harvestPrediction.days_remaining}
          </div>
          <p className="text-muted-foreground text-sm mt-1">ngày</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          {/* Confidence Badge */}
          <span
            className={cn(
              'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
              confidence.bgClass,
              confidence.textClass,
              confidence.borderClass
            )}
          >
            Độ tin cậy: {confidence.label}
          </span>

          {/* Estimated Yield */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-secondary/50 text-secondary-foreground border border-secondary/30">
            <Scale className="w-4 h-4" />
            Ước tính: ~{harvestPrediction.estimated_yield}
          </span>
        </div>

        {/* Predicted Date */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Dự kiến thu hoạch: {formatDate(harvestPrediction.predicted_harvest_date)}</span>
        </div>
      </div>

      {/* Growth Stage Stepper */}
      <div className="bg-card rounded-2xl border border-border/50 p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-6">
          Giai đoạn sinh trưởng
        </h2>

        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-border hidden md:block" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 hidden md:block"
            style={{ width: `${((currentStageIndex) / (GROWTH_STAGES_VI.length - 1)) * 100}%` }}
          />

          {/* Stages */}
          <div className="flex md:justify-between gap-4 overflow-x-auto pb-2 md:pb-0">
            {GROWTH_STAGES_VI.map((stage, index) => {
              const isCompleted = harvestPrediction.growth_stages_completed.includes(stage.key)
              const isCurrent = index === currentStageIndex && !harvestPrediction.growth_stages_remaining.includes(stage.key)

              return (
                <div key={stage.key} className="flex flex-col items-center min-w-[80px]">
                  {/* Icon */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300',
                      isCompleted && 'bg-primary text-primary-foreground',
                      isCurrent && 'bg-primary/20 text-primary ring-2 ring-primary',
                      !isCompleted && !isCurrent && 'bg-secondary text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Circle className={cn('w-5 h-5', isCurrent && 'fill-primary/30')} />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      'text-xs font-medium text-center',
                      (isCompleted || isCurrent) ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {stage.label}
                  </span>

                  {/* Stage indicator for mobile */}
                  <span className="text-[10px] text-muted-foreground mt-0.5 md:hidden">
                    {isCompleted ? '✓' : isCurrent ? '●' : '○'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Per-Garden Cards Demo (single garden) */}
      <div className="bg-card rounded-2xl border border-border/50 p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
          Chi tiết theo vườn
        </h2>

        <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{activeGarden?.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {activeGarden?.crop_type} • {activeGarden?.area_m2}m²
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Giai đoạn hiện tại</p>
              <p className="font-medium text-primary">
                {GROWTH_STAGES_VI[currentStageIndex]?.label || 'Chín'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
