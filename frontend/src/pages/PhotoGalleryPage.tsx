import { useState } from 'react'
import { Image, ChevronLeft, ChevronRight, Download, Trash2, X, Camera, Sparkles, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

interface GalleryPhoto {
  id: string
  imageUrl: string
  source: 'camera' | 'ai_scan' | 'growth_tracking'
  date: string
  title?: string
}

const MOCK_PHOTOS: GalleryPhoto[] = [
  { id: 'p1', imageUrl: 'https://picsum.photos/id/1084/600/600', source: 'camera', date: '2026-06-21T10:00:00Z', title: 'Zone 1 - Buổi sáng' },
  { id: 'p2', imageUrl: 'https://picsum.photos/id/1067/600/600', source: 'ai_scan', date: '2026-06-21T08:30:00Z', title: 'Phát hiện Brown Spot' },
  { id: 'p3', imageUrl: 'https://picsum.photos/id/1080/600/600', source: 'growth_tracking', date: '2026-06-21T07:00:00Z', title: 'Tuần 5 - Chiều cao 35cm' },
  { id: 'p4', imageUrl: 'https://picsum.photos/id/1074/600/600', source: 'camera', date: '2026-06-20T18:00:00Z', title: 'Zone 2 - Buổi chiều' },
  { id: 'p5', imageUrl: 'https://picsum.photos/id/1070/600/600', source: 'ai_scan', date: '2026-06-20T15:00:00Z', title: 'Cây khỏe mạnh' },
  { id: 'p6', imageUrl: 'https://picsum.photos/id/1081/600/600', source: 'growth_tracking', date: '2026-06-14T08:00:00Z', title: 'Tuần 4 - Chiều cao 27cm' },
  { id: 'p7', imageUrl: 'https://picsum.photos/id/1036/600/600', source: 'camera', date: '2026-06-20T12:00:00Z', title: 'Zone 1 - Buổi trưa' },
  { id: 'p8', imageUrl: 'https://picsum.photos/id/1082/600/600', source: 'growth_tracking', date: '2026-06-07T09:00:00Z', title: 'Tuần 3 - Chiều cao 18cm' },
  { id: 'p9', imageUrl: 'https://picsum.photos/id/1076/600/600', source: 'camera', date: '2026-06-19T07:00:00Z', title: 'Zone 1 - Sáng sớm' },
  { id: 'p10', imageUrl: 'https://picsum.photos/id/1080/600/600', source: 'ai_scan', date: '2026-06-20T08:00:00Z', title: 'Phát hiện Powdery Mildew' },
  { id: 'p11', imageUrl: 'https://picsum.photos/id/1077/600/600', source: 'camera', date: '2026-06-18T17:00:00Z', title: 'Zone 2 - Chiều muộn' },
  { id: 'p12', imageUrl: 'https://picsum.photos/id/1083/600/600', source: 'growth_tracking', date: '2026-06-14T10:00:00Z', title: 'Tuần 4 - Đếm lá 14' },
  { id: 'p13', imageUrl: 'https://picsum.photos/id/1039/600/600', source: 'camera', date: '2026-06-17T16:00:00Z', title: 'Zone 1 - Chiều' },
  { id: 'p14', imageUrl: 'https://picsum.photos/id/1081/600/600', source: 'ai_scan', date: '2026-06-18T09:00:00Z', title: 'Kiểm tra định kỳ' },
  { id: 'p15', imageUrl: 'https://picsum.photos/id/1078/600/600', source: 'camera', date: '2026-06-16T11:00:00Z', title: 'Zone 2 - Trưa' },
  { id: 'p16', imageUrl: 'https://picsum.photos/id/1082/600/600', source: 'growth_tracking', date: '2026-06-07T07:00:00Z', title: 'Tuần 3 - Giai đoạn phát triển' },
]

type FilterSource = 'all' | 'camera' | 'ai_scan' | 'growth_tracking'

export default function PhotoGalleryPage() {
  const { user } = useAuth()
  const [sourceFilter, setSourceFilter] = useState<FilterSource>('all')
  const [displayCount, setDisplayCount] = useState(12)
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const filteredPhotos = MOCK_PHOTOS.filter(photo => {
    if (sourceFilter === 'all') return true
    return photo.source === sourceFilter
  })

  const displayedPhotos = filteredPhotos.slice(0, displayCount)

  const handlePrev = () => {
    if (lightboxIndex > 0) {
      const newIndex = lightboxIndex - 1
      setLightboxIndex(newIndex)
      setLightboxPhoto(filteredPhotos[newIndex])
    }
  }

  const handleNext = () => {
    if (lightboxIndex < filteredPhotos.length - 1) {
      const newIndex = lightboxIndex + 1
      setLightboxIndex(newIndex)
      setLightboxPhoto(filteredPhotos[newIndex])
    }
  }

  const openLightbox = (photo: GalleryPhoto, index: number) => {
    setLightboxPhoto(photo)
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxPhoto(null)
    setLightboxIndex(0)
  }

  const handleDownload = (photo: GalleryPhoto) => {
    const link = document.createElement('a')
    link.href = photo.imageUrl
    link.download = `garden_${photo.id}.jpg`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDelete = (photoId: string) => {
    if (confirm('Bạn có chắc muốn xóa ảnh này?')) {
      console.log('Deleting photo:', photoId)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getSourceLabel = (source: GalleryPhoto['source']) => {
    switch (source) {
      case 'camera': return 'Camera'
      case 'ai_scan': return 'AI Scan'
      case 'growth_tracking': return 'Growth Tracking'
    }
  }

  const getSourceIcon = (source: GalleryPhoto['source']) => {
    switch (source) {
      case 'camera': return <Camera className="w-3 h-3" />
      case 'ai_scan': return <Sparkles className="w-3 h-3" />
      case 'growth_tracking': return <TrendingUp className="w-3 h-3" />
    }
  }

  const getSourceColor = (source: GalleryPhoto['source']) => {
    switch (source) {
      case 'camera': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'ai_scan': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'growth_tracking': return 'bg-green-500/20 text-green-400 border-green-500/30'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Thư viện ảnh
        </h1>
        <p className="text-muted-foreground mt-1">
          Quản lý và xem lại các ảnh từ camera và AI
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Nguồn:</label>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as FilterSource)}
            className={cn(
              'px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary'
            )}
          >
            <option value="all">Tất cả</option>
            <option value="camera">Camera</option>
            <option value="ai_scan">AI Scan</option>
            <option value="growth_tracking">Growth Tracking</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Khoảng ngày:</label>
          <input
            type="date"
            className={cn(
              'px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary'
            )}
          />
          <span className="text-muted-foreground">-</span>
          <input
            type="date"
            className={cn(
              'px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary'
            )}
          />
        </div>

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredPhotos.length} ảnh
        </div>
      </div>

      {/* Masonry Grid */}
      {displayedPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Image className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg">Chưa có ảnh nào</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {displayedPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="aspect-square rounded-lg overflow-hidden bg-card border border-border group relative cursor-pointer"
                onClick={() => openLightbox(photo, index)}
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.title || 'Gallery photo'}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute top-3 left-3">
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
                      getSourceColor(photo.source)
                    )}>
                      {getSourceIcon(photo.source)}
                      {getSourceLabel(photo.source)}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white text-sm font-medium truncate">
                      {formatDate(photo.date)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {displayCount < filteredPhotos.length && (
            <div className="flex justify-center">
              <button
                onClick={() => setDisplayCount(prev => prev + 8)}
                className={cn(
                  'px-6 py-3 rounded-lg font-medium transition-colors',
                  'bg-card border border-border text-foreground hover:bg-accent',
                  'focus:outline-none focus:ring-2 focus:ring-primary'
                )}
              >
                Xem thêm ({filteredPhotos.length - displayCount} ảnh)
              </button>
            </div>
          )}
        </>
      )}

      {/* Lightbox Dialog */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev Button */}
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            disabled={lightboxIndex === 0}
            className={cn(
              'absolute left-4 p-3 rounded-full bg-white/10 text-white transition-colors',
              'hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed'
            )}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Button */}
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            disabled={lightboxIndex === filteredPhotos.length - 1}
            className={cn(
              'absolute right-4 p-3 rounded-full bg-white/10 text-white transition-colors',
              'hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed'
            )}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image Container */}
          <div
            className="relative max-w-5xl max-h-[85vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxPhoto.imageUrl}
              alt={lightboxPhoto.title || 'Gallery photo'}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />

            {/* Info Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className={cn(
                    'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border mb-2',
                    getSourceColor(lightboxPhoto.source)
                  )}>
                    {getSourceIcon(lightboxPhoto.source)}
                    {getSourceLabel(lightboxPhoto.source)}
                  </span>
                  <p className="text-white font-medium">{lightboxPhoto.title}</p>
                  <p className="text-white/70 text-sm">{formatDate(lightboxPhoto.date)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(lightboxPhoto)}
                    className={cn(
                      'p-3 rounded-lg transition-colors',
                      'bg-white/10 text-white hover:bg-white/20'
                    )}
                    title="Tải xuống"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  {user?.role === 'OWNER' && (
                    <button
                      onClick={() => handleDelete(lightboxPhoto.id)}
                      className={cn(
                        'p-3 rounded-lg transition-colors',
                        'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      )}
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Image Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
              {lightboxIndex + 1} / {filteredPhotos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
