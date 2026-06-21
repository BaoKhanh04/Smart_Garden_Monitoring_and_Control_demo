import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Droplets,
  Thermometer,
  Bug,
  Sun,
  Lightbulb,
  ChevronDown,
  X,
  CheckCheck,
  Leaf,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import type { Recommendation } from '@/types'

type FilterType = 'all' | 'critical' | 'should_do_soon' | 'recommended'

const PRIORITY_CONFIG = {
  critical: {
    label: 'Nguy cơ',
    borderColor: '#ef4444',
    badgeBg: 'bg-red-500/20 text-red-400',
  },
  should_do_soon: {
    label: 'Sớm',
    borderColor: '#f59e0b',
    badgeBg: 'bg-amber-500/20 text-amber-400',
  },
  recommended: {
    label: 'Khuyến nghị',
    borderColor: '#22c55e',
    badgeBg: 'bg-emerald-500/20 text-emerald-400',
  },
} as const

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  disease: Bug,
  irrigation: Droplets,
  temperature: Thermometer,
  light: Sun,
}

function RecommendationCard({
  recommendation,
  onDismiss,
  onQuickAction,
}: {
  recommendation: Recommendation
  onDismiss: (id: string) => void
  onQuickAction: (rec: Recommendation) => void
}) {
  const [showSnooze, setShowSnooze] = useState(false)
  const config = PRIORITY_CONFIG[recommendation.priority]
  const Icon = CATEGORY_ICON_MAP[recommendation.category] ?? Lightbulb

  const handleQuickAction = () => {
    if (recommendation.quick_action?.route) {
      onQuickAction(recommendation)
    } else if (recommendation.quick_action?.device) {
      onQuickAction(recommendation)
    }
  }

  return (
    <div
      className="bg-card rounded-xl border border-border overflow-hidden transition-all hover:shadow-lg hover:shadow-black/20"
      style={{ borderLeftWidth: '4px', borderLeftColor: config.borderColor }}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: `${config.borderColor}20` }}
          >
            <Icon className="w-5 h-5" style={{ color: config.borderColor }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', config.badgeBg)}>
                    {config.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(recommendation.created_at).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-base">{recommendation.title}</h3>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowSnooze(!showSnooze)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showSnooze && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-lg shadow-xl z-10 overflow-hidden animate-slide-down">
                    <button
                      onClick={() => { onDismiss(recommendation.id); setShowSnooze(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Bỏ qua
                    </button>
                    <button
                      onClick={() => { onDismiss(recommendation.id); setShowSnooze(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      <CheckCheck className="w-4 h-4" />
                      Đánh dấu đã xem
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {recommendation.description}
            </p>

            {recommendation.quick_action && (
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={handleQuickAction}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {recommendation.quick_action.label}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RecommendationsPage() {
  const { recommendations, dismissedRecommendationIds, dismissRecommendation } = useApp()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FilterType>('all')

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      if (dismissedRecommendationIds.includes(rec.id)) return false
      if (filter === 'all') return true
      return rec.priority === filter
    })
  }, [recommendations, dismissedRecommendationIds, filter])

  const handleQuickAction = (rec: Recommendation) => {
    if (rec.quick_action?.route) {
      navigate(rec.quick_action.route)
    }
  }

  const filterButtons: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'critical', label: 'Nguy cơ' },
    { value: 'should_do_soon', label: 'Sớm' },
    { value: 'recommended', label: 'Khuyến nghị' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Gợi ý chăm sóc AI</h1>
          <p className="text-muted-foreground mt-1">
            {filteredRecommendations.length} gợi ý mới
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-1.5 inline-flex">
        <div className="flex gap-1">
          {filterButtons.map(btn => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                filter === btn.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {filteredRecommendations.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
              <Leaf className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Vườn của bạn đang rất ổn
            </h3>
            <p className="text-muted-foreground max-w-sm">
              Chưa có gợi ý nào mới! Hệ thống AI sẽ thông báo khi có đề xuất chăm sóc vườn.
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl space-y-4">
          {filteredRecommendations.map(rec => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onDismiss={dismissRecommendation}
              onQuickAction={handleQuickAction}
            />
          ))}
        </div>
      )}
    </div>
  )
}
