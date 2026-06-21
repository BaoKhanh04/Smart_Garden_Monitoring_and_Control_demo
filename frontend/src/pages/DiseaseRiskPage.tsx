import { useState } from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { AlertTriangle, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import type { DiseaseRisk } from '@/types'

interface RiskGaugeProps {
  disease: DiseaseRisk
}

function getRiskColor(risk: number): string {
  if (risk <= 30) return '#22c55e'
  if (risk <= 60) return '#f59e0b'
  return '#ef4444'
}

function getRiskLabel(risk: number): string {
  if (risk <= 30) return 'Thấp'
  if (risk <= 60) return 'Trung bình'
  return 'Cao'
}

function RiskGauge({ disease }: RiskGaugeProps) {
  const [expanded, setExpanded] = useState(false)
  const riskColor = getRiskColor(disease.risk_pct)
  const riskLabel = getRiskLabel(disease.risk_pct)
  const sparklineData = disease.trend_7d.map((value, index) => ({ day: index, value }))

  const sparklineColor = disease.risk_pct > 60 ? '#ef4444' : disease.risk_pct > 30 ? '#f59e0b' : '#22c55e'

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-start gap-4 text-left hover:bg-accent/30 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-foreground text-lg">{disease.disease}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-2xl font-bold"
                  style={{ color: riskColor }}
                >
                  {disease.risk_pct}%
                </span>
                <span
                  className={cn(
                    'text-xs font-semibold px-2 py-0.5 rounded-full',
                    disease.risk_pct <= 30 && 'bg-green-500/20 text-green-400',
                    disease.risk_pct > 30 && disease.risk_pct <= 60 && 'bg-amber-500/20 text-amber-400',
                    disease.risk_pct > 60 && 'bg-red-500/20 text-red-400'
                  )}
                >
                  {riskLabel}
                </span>
              </div>
            </div>

            <div className="w-20 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={sparklineColor}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${disease.risk_pct}%`,
                    backgroundColor: riskColor,
                  }}
                />
              </div>
              <span className="text-sm font-medium text-muted-foreground w-12 text-right">
                {disease.risk_pct}%
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Xu hướng 7 ngày:</span>
              {disease.trend_7d[disease.trend_7d.length - 1] > disease.trend_7d[0] ? (
                <span className="text-red-400 font-medium">Tăng</span>
              ) : disease.trend_7d[disease.trend_7d.length - 1] < disease.trend_7d[0] ? (
                <span className="text-green-400 font-medium">Giảm</span>
              ) : (
                <span className="text-muted-foreground font-medium">Ổn định</span>
              )}
              <span className="text-muted-foreground">
                ({disease.trend_7d[0]}% → {disease.trend_7d[disease.trend_7d.length - 1]}%)
              </span>
            </div>
          </div>
        </div>

        <div className="p-1 text-muted-foreground">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border pt-4 animate-slide-down">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-foreground">Yếu tố nguy cơ</h4>
          </div>

          <div className="space-y-3">
            {disease.factors.map((factor, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">{factor.label}</span>
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        factor.contribution_pct > 0 ? 'text-red-400' : 'text-green-400'
                      )}
                    >
                      {factor.contribution_pct > 0 ? '+' : ''}{factor.contribution_pct}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        factor.contribution_pct > 0 ? 'bg-red-500/70' : 'bg-green-500/70'
                      )}
                      style={{
                        width: `${Math.min(Math.abs(factor.contribution_pct), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-accent/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Gợi ý: </span>
              {disease.risk_pct > 60
                ? 'Cần hành động ngay. Phun thuốc phòng trừ và kiểm tra hệ thống thông gió.'
                : disease.risk_pct > 30
                ? 'Theo dõi sát và chuẩn bị sẵn sàng các biện pháp xử lý.'
                : 'Tiếp tục duy trì điều kiện hiện tại và theo dõi.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DiseaseRiskPage() {
  const { diseaseRisk } = useApp()

  const hasHighRisk = diseaseRisk.some(d => d.risk_pct > 60)
  const highestRisk = diseaseRisk.reduce((max, d) => (d.risk_pct > max.risk_pct ? d : max), diseaseRisk[0])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Dự đoán nguy cơ bệnh</h1>
          <p className="text-muted-foreground mt-1">
            AI phân tích và dự đoán nguy cơ bệnh cho vườn
          </p>
        </div>
      </div>

      {hasHighRisk && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive">Cảnh báo nguy cơ cao!</h3>
            <p className="text-sm text-destructive/80 mt-1">
              {highestRisk.disease} đang ở mức nguy hiểm ({highestRisk.risk_pct}%). 
              Cần hành động ngay để ngăn chặn lây lan.
            </p>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {diseaseRisk.map(disease => (
            <RiskGauge key={disease.disease} disease={disease} />
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4">Chú thích mức độ rủi ro</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <div>
              <p className="text-sm font-medium text-foreground">Thấp (0-30%)</p>
              <p className="text-xs text-muted-foreground">Nguy cơ thấp, tiếp tục theo dõi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-amber-500" />
            <div>
              <p className="text-sm font-medium text-foreground">Trung bình (31-60%)</p>
              <p className="text-xs text-muted-foreground">Cần chú ý và chuẩn bị xử lý</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <div>
              <p className="text-sm font-medium text-foreground">Cao (61-100%)</p>
              <p className="text-xs text-muted-foreground">Hành động ngay để ngăn chặn</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
