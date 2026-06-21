import { useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { cn } from '@/lib/utils'
import { Camera, ChevronLeft, ChevronRight, Ruler, Leaf } from 'lucide-react'

const WEEK_LABELS = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5']

export default function GrowthTrackingPage() {
  const { growthPhotos } = useApp()
  const [selectedWeek, setSelectedWeek] = useState(growthPhotos.length - 1)
  const [compareMode, setCompareMode] = useState(false)
  const [compareWeek, setCompareWeek] = useState(0)

  const currentPhoto = growthPhotos[selectedWeek]
  const comparePhoto = growthPhotos[compareWeek]
  const maxWeek = growthPhotos.length

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    setSelectedWeek(value)
    if (compareMode && value <= compareWeek) {
      setCompareWeek(Math.max(0, value - 1))
    }
  }

  const goToPrevious = () => {
    if (selectedWeek > 0) {
      setSelectedWeek(selectedWeek - 1)
      if (compareMode && compareWeek >= selectedWeek) {
        setCompareWeek(selectedWeek - 1)
      }
    }
  }

  const goToNext = () => {
    if (selectedWeek < maxWeek - 1) {
      setSelectedWeek(selectedWeek + 1)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  if (growthPhotos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Camera className="w-12 h-12 mb-4 opacity-50" />
        <p>Chưa có ảnh theo dõi tăng trưởng</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Theo dõi tăng trưởng</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Hình ảnh và chỉ số sinh trưởng của cây theo từng tuần
          </p>
        </div>

        {/* Compare Toggle */}
        <button
          onClick={() => setCompareMode(!compareMode)}
          className={cn(
            'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
            compareMode
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          {compareMode ? 'Tắt so sánh' : 'So sánh'}
        </button>
      </div>

      {/* Timeline Slider */}
      <div className="bg-card rounded-2xl border border-border/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">{WEEK_LABELS[0]}</span>
          <span className="text-sm font-medium text-primary">
            {WEEK_LABELS[selectedWeek]}
          </span>
          <span className="text-sm text-muted-foreground">{WEEK_LABELS[maxWeek - 1]}</span>
        </div>

        {/* Range Slider */}
        <div className="relative">
          <input
            type="range"
            min="0"
            max={maxWeek - 1}
            value={selectedWeek}
            onChange={handleSliderChange}
            className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
                       [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform
                       [&::-webkit-slider-thumb]:hover:scale-110
                       [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
                       [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0
                       [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>

        {/* Week Dots */}
        <div className="flex justify-between mt-3 px-1">
          {growthPhotos.map((photo, index) => (
            <button
              key={photo.week}
              onClick={() => setSelectedWeek(index)}
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-200',
                index === selectedWeek
                  ? 'bg-primary scale-125'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Chọn ${WEEK_LABELS[index]}`}
            />
          ))}
        </div>
      </div>

      {/* Main Image Area */}
      {compareMode ? (
        /* Before/After Compare View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before */}
          <div className="bg-card rounded-2xl border border-border/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                {WEEK_LABELS[compareWeek]}
              </span>
              <button
                onClick={() => {
                  setCompareWeek(Math.max(0, compareWeek - 1))
                  setSelectedWeek(Math.max(compareWeek - 1, selectedWeek))
                }}
                disabled={compareWeek === 0}
                className="p-1 rounded hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary/30">
              <img
                src={comparePhoto.image_url}
                alt={WEEK_LABELS[compareWeek]}
                className="w-full h-full object-cover"
              />

              {/* Metrics Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center gap-4 text-white text-sm">
                  <span className="flex items-center gap-1">
                    <Ruler className="w-4 h-4" />
                    {comparePhoto.height_cm}cm
                  </span>
                  <span className="flex items-center gap-1">
                    <Leaf className="w-4 h-4" />
                    {comparePhoto.leaf_count} lá
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-2 text-center">
              {formatDate(comparePhoto.date)}
            </p>
          </div>

          {/* After */}
          <div className="bg-card rounded-2xl border border-border/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-primary">
                {WEEK_LABELS[selectedWeek]}
              </span>
              <button
                onClick={() => {
                  setCompareWeek(Math.min(maxWeek - 1, compareWeek + 1))
                }}
                disabled={compareWeek >= selectedWeek}
                className="p-1 rounded hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary/30">
              <img
                src={currentPhoto.image_url}
                alt={WEEK_LABELS[selectedWeek]}
                className="w-full h-full object-cover"
              />

              {/* Metrics Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center gap-4 text-white text-sm">
                  <span className="flex items-center gap-1">
                    <Ruler className="w-4 h-4" />
                    {currentPhoto.height_cm}cm
                  </span>
                  <span className="flex items-center gap-1">
                    <Leaf className="w-4 h-4" />
                    {currentPhoto.leaf_count} lá
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-2 text-center">
              {formatDate(currentPhoto.date)}
            </p>
          </div>
        </div>
      ) : (
        /* Single Image View */
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={goToPrevious}
                disabled={selectedWeek === 0}
                className="p-2 rounded-lg hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium">
                {WEEK_LABELS[selectedWeek]} • {formatDate(currentPhoto.date)}
              </span>
              <button
                onClick={goToNext}
                disabled={selectedWeek === maxWeek - 1}
                className="p-2 rounded-lg hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Auto-capture Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Camera className="w-3.5 h-3.5" />
              <span>Ảnh được chụp tự động</span>
            </div>
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary/30">
            <img
              src={currentPhoto.image_url}
              alt={WEEK_LABELS[selectedWeek]}
              className="w-full h-full object-cover"
            />

            {/* Growth Metrics Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="flex items-center gap-6 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Ruler className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-white/70">Chiều cao</p>
                    <p className="font-semibold">{currentPhoto.height_cm} cm</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-white/70">Số lá</p>
                    <p className="font-semibold">{currentPhoto.leaf_count}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-capture Info */}
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <Camera className="w-3.5 h-3.5" />
            <span>Ảnh được chụp tự động mỗi 3 ngày lúc 7:00 sáng</span>
          </div>
        </div>
      )}

      {/* Growth Summary */}
      <div className="bg-card rounded-2xl border border-border/50 p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
          Tổng kết tăng trưởng
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-secondary/30 rounded-xl p-4 text-center border border-border/30">
            <p className="text-2xl font-bold text-primary">
              +{currentPhoto.height_cm - growthPhotos[0].height_cm}cm
            </p>
            <p className="text-xs text-muted-foreground mt-1">Tăng chiều cao</p>
          </div>
          <div className="bg-secondary/30 rounded-xl p-4 text-center border border-border/30">
            <p className="text-2xl font-bold text-emerald-400">
              +{currentPhoto.leaf_count - growthPhotos[0].leaf_count}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Thêm lá mới</p>
          </div>
          <div className="bg-secondary/30 rounded-xl p-4 text-center border border-border/30">
            <p className="text-2xl font-bold text-foreground">
              {maxWeek}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Tuần theo dõi</p>
          </div>
          <div className="bg-secondary/30 rounded-xl p-4 text-center border border-border/30">
            <p className="text-2xl font-bold text-amber-400">
              {Math.round(((currentPhoto.height_cm - growthPhotos[0].height_cm) / growthPhotos[0].height_cm) * 100)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Tăng trưởng</p>
          </div>
        </div>
      </div>
    </div>
  )
}
