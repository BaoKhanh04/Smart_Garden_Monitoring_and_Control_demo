import { useState, useEffect } from 'react'
import { Save, RotateCcw, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import type { ThresholdConfig } from '@/types'

interface ThresholdSliderProps {
  label: string
  unit: string
  min: number
  max: number
  step?: number
  valueMin: number
  valueMax: number
  onMinChange: (value: number) => void
  onMaxChange: (value: number) => void
  isInvalid?: boolean
}

function ThresholdSlider({
  label,
  unit,
  min,
  max,
  step = 1,
  valueMin,
  valueMax,
  onMinChange,
  onMaxChange,
  isInvalid,
}: ThresholdSliderProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl bg-card border transition-colors',
        isInvalid ? 'border-destructive' : 'border-border'
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {valueMin} - {valueMax} {unit}
          </span>
          {isInvalid && (
            <span className="text-xs text-destructive font-medium">Min {'>'} Max</span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Min: {valueMin}{unit}</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={valueMin}
            onChange={(e) => onMinChange(Number(e.target.value))}
            className={cn(
              'w-full h-2 rounded-full appearance-none cursor-pointer',
              'bg-secondary',
              '[&::-webkit-slider-thumb]:appearance-none',
              '[&::-webkit-slider-thumb]:w-4',
              '[&::-webkit-slider-thumb]:h-4',
              '[&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:bg-primary',
              '[&::-webkit-slider-thumb]:cursor-pointer',
              '[&::-webkit-slider-thumb]:shadow-md',
              '[&::-webkit-slider-thumb]:transition-transform',
              '[&::-webkit-slider-thumb]:hover:scale-110',
              '[&::-moz-range-thumb]:w-4',
              '[&::-moz-range-thumb]:h-4',
              '[&::-moz-range-thumb]:rounded-full',
              '[&::-moz-range-thumb]:bg-primary',
              '[&::-moz-range-thumb]:border-0',
              '[&::-moz-range-thumb]:cursor-pointer'
            )}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Max: {valueMax}{unit}</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={valueMax}
            onChange={(e) => onMaxChange(Number(e.target.value))}
            className={cn(
              'w-full h-2 rounded-full appearance-none cursor-pointer',
              'bg-secondary',
              '[&::-webkit-slider-thumb]:appearance-none',
              '[&::-webkit-slider-thumb]:w-4',
              '[&::-webkit-slider-thumb]:h-4',
              '[&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:bg-primary',
              '[&::-webkit-slider-thumb]:cursor-pointer',
              '[&::-webkit-slider-thumb]:shadow-md',
              '[&::-webkit-slider-thumb]:transition-transform',
              '[&::-webkit-slider-thumb]:hover:scale-110',
              '[&::-moz-range-thumb]:w-4',
              '[&::-moz-range-thumb]:h-4',
              '[&::-moz-range-thumb]:rounded-full',
              '[&::-moz-range-thumb]:bg-primary',
              '[&::-moz-range-thumb]:border-0',
              '[&::-moz-range-thumb]:cursor-pointer'
            )}
          />
        </div>
      </div>
    </div>
  )
}

type SystemMode = 'auto' | 'manual' | 'fallback'

const SYSTEM_MODES: { value: SystemMode; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'manual', label: 'Manual' },
  { value: 'fallback', label: 'Fallback' },
]

export default function ThresholdsPage() {
  const { thresholds, updateThresholds } = useApp()
  const [isDirty, setIsDirty] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const [formData, setFormData] = useState<ThresholdConfig>(thresholds)

  useEffect(() => {
    const hasChanges =
      JSON.stringify(formData) !== JSON.stringify(thresholds)
    setIsDirty(hasChanges)
  }, [formData, thresholds])

  const handleSave = () => {
    updateThresholds(formData)
    setShowToast(true)
    setIsDirty(false)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleCancel = () => {
    setFormData(thresholds)
    setIsDirty(false)
  }

  const handleModeChange = (mode: SystemMode) => {
    setFormData((prev) => ({ ...prev, system_mode: mode }))
  }

  const updateThreshold = (
    key: keyof ThresholdConfig['thresholds'],
    type: 'min' | 'max',
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [key]: {
          ...prev.thresholds[key],
          [type]: value,
        },
      },
    }))
  }

  const isInvalid = (key: keyof ThresholdConfig['thresholds']) => {
    const t = formData.thresholds[key]
    return t.min > t.max
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Toast */}
      <div
        className={cn(
          'fixed top-4 right-4 z-50 px-4 py-3 rounded-lg bg-primary text-primary-foreground shadow-lg',
          'flex items-center gap-2 font-medium transition-all duration-300',
          showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        )}
      >
        <Check className="w-5 h-5" />
        <span>Đã cập nhật ngưỡng cấu hình mới thành công!</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Cấu hình ngưỡng
        </h1>
        <p className="text-muted-foreground mt-1">
          Thiết lập các ngưỡng tối thiểu và tối đa cho cảm biến
        </p>
      </div>

      {/* System Mode Selector */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-foreground mb-3">Chế độ hệ thống</h2>
        <div className="flex gap-2">
          {SYSTEM_MODES.map((mode) => (
            <button
              key={mode.value}
              onClick={() => handleModeChange(mode.value)}
              className={cn(
                'px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200',
                formData.system_mode === mode.value
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground border border-border'
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Threshold Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <ThresholdSlider
          label="Nhiệt độ"
          unit="°C"
          min={0}
          max={60}
          step={0.5}
          valueMin={formData.thresholds.temperature.min}
          valueMax={formData.thresholds.temperature.max}
          onMinChange={(v) => updateThreshold('temperature', 'min', v)}
          onMaxChange={(v) => updateThreshold('temperature', 'max', v)}
          isInvalid={isInvalid('temperature')}
        />

        <ThresholdSlider
          label="Độ ẩm không khí"
          unit="%"
          min={0}
          max={100}
          step={1}
          valueMin={formData.thresholds.air_humidity.min}
          valueMax={formData.thresholds.air_humidity.max}
          onMinChange={(v) => updateThreshold('air_humidity', 'min', v)}
          onMaxChange={(v) => updateThreshold('air_humidity', 'max', v)}
          isInvalid={isInvalid('air_humidity')}
        />

        <ThresholdSlider
          label="Độ ẩm đất"
          unit="%"
          min={0}
          max={100}
          step={1}
          valueMin={formData.thresholds.soil_moisture.min}
          valueMax={formData.thresholds.soil_moisture.max}
          onMinChange={(v) => updateThreshold('soil_moisture', 'min', v)}
          onMaxChange={(v) => updateThreshold('soil_moisture', 'max', v)}
          isInvalid={isInvalid('soil_moisture')}
        />

        <ThresholdSlider
          label="pH"
          unit=""
          min={0}
          max={14}
          step={0.1}
          valueMin={formData.thresholds.ph.min}
          valueMax={formData.thresholds.ph.max}
          onMinChange={(v) => updateThreshold('ph', 'min', v)}
          onMaxChange={(v) => updateThreshold('ph', 'max', v)}
          isInvalid={isInvalid('ph')}
        />

        <div className="md:col-span-2">
          <ThresholdSlider
            label="Cường độ ánh sáng"
            unit=" lux"
            min={0}
            max={100000}
            step={1000}
            valueMin={formData.thresholds.light_lux.min}
            valueMax={formData.thresholds.light_lux.max}
            onMinChange={(v) => updateThreshold('light_lux', 'min', v)}
            onMaxChange={(v) => updateThreshold('light_lux', 'max', v)}
            isInvalid={isInvalid('light_lux')}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <button
          onClick={handleSave}
          disabled={!isDirty}
          className={cn(
            'flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm',
            'bg-primary text-primary-foreground',
            'hover:bg-primary/90',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200'
          )}
        >
          <Save className="w-4 h-4" />
          <span>Lưu thay đổi</span>
        </button>

        <button
          onClick={handleCancel}
          disabled={!isDirty}
          className={cn(
            'flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm',
            'bg-card text-muted-foreground border border-border',
            'hover:bg-accent hover:text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200'
          )}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Hủy bỏ</span>
        </button>
      </div>
    </div>
  )
}
