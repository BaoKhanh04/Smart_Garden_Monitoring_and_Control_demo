import { useState } from 'react'
import { Plus, Pencil, Trash2, X, MoreVertical, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Garden } from '@/types'

const CROP_TYPES = [
  'Rau ăn lá',
  'Rau ăn quả',
  'Cà chua',
  'Dưa leo',
  'Ớt',
  'Bầu bí',
  'Rau thơm',
  'Hoa',
  'Cây ăn trái',
]

interface GardenModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (garden: Partial<Garden>) => void
  editingGarden: Garden | null
}

function GardenModal({ isOpen, onClose, onSave, editingGarden }: GardenModalProps) {
  const [formData, setFormData] = useState({
    name: editingGarden?.name || '',
    area_m2: editingGarden?.area_m2 || 0,
    crop_type: editingGarden?.crop_type || CROP_TYPES[0],
    description: editingGarden?.description || '',
    cover_image_url: editingGarden?.cover_image_url || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Tên vườn là bắt buộc'
    if (formData.area_m2 <= 0) newErrors.area_m2 = 'Diện tích phải lớn hơn 0'
    if (!formData.cover_image_url.trim()) {
      newErrors.cover_image_url = 'URL hình ảnh là bắt buộc'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave({
      ...(editingGarden || {}),
      ...formData,
      id: editingGarden?.id || `garden_${Date.now()}`,
      device_count: editingGarden?.device_count || 0,
      device_online: editingGarden?.device_online || 0,
      created_at: editingGarden?.created_at || new Date().toISOString(),
    } as Garden)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-2xl border border-border w-full max-w-lg mx-4 animate-slide-down">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            {editingGarden ? 'Chỉnh sửa vườn' : 'Thêm vườn mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tên vườn</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="VD: Vườn Sân Thượng"
              className={cn(
                'w-full px-3 py-2 rounded-lg bg-input border text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary',
                errors.name ? 'border-destructive' : 'border-border'
              )}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Diện tích (m²)</label>
              <input
                type="number"
                min="0"
                value={formData.area_m2 || ''}
                onChange={(e) => handleChange('area_m2', Number(e.target.value))}
                placeholder="0"
                className={cn(
                  'w-full px-3 py-2 rounded-lg bg-input border text-foreground placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary',
                  errors.area_m2 ? 'border-destructive' : 'border-border'
                )}
              />
              {errors.area_m2 && <p className="text-xs text-destructive">{errors.area_m2}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Loại cây trồng</label>
              <select
                value={formData.crop_type}
                onChange={(e) => handleChange('crop_type', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CROP_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">URL hình ảnh bìa</label>
            <input
              type="url"
              value={formData.cover_image_url}
              onChange={(e) => handleChange('cover_image_url', e.target.value)}
              placeholder="https://..."
              className={cn(
                'w-full px-3 py-2 rounded-lg bg-input border text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary',
                errors.cover_image_url ? 'border-destructive' : 'border-border'
              )}
            />
            {errors.cover_image_url && <p className="text-xs text-destructive">{errors.cover_image_url}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Mô tả ngắn về vườn của bạn..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:bg-accent transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {editingGarden ? 'Cập nhật' : 'Tạo vườn'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface AlertDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
}

function AlertDialog({ isOpen, onClose, onConfirm, title, description }: AlertDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-2xl border border-border w-full max-w-sm mx-4 animate-slide-down">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:bg-accent transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  )
}

interface GardenCardProps {
  garden: Garden
  onEdit: () => void
  onDelete: () => void
}

function GardenCard({ garden, onEdit, onDelete }: GardenCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden group">
      {/* Cover Image */}
      <div className="aspect-video bg-muted overflow-hidden relative">
        <img
          src={garden.cover_image_url || 'https://picsum.photos/400/225'}
          alt={garden.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://picsum.photos/400/225'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Device Status Badge */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs font-medium text-white">
          {garden.device_online}/{garden.device_count} thiết bị hoạt động
        </div>

        {/* Menu Button */}
        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
            className="p-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 w-32 py-1 rounded-lg bg-card border border-border shadow-lg z-10">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); setShowMenu(false) }}
                className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-accent flex items-center gap-2"
              >
                <Pencil className="w-3.5 h-3.5" />
                Sửa
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false) }}
                className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-1">{garden.name}</h3>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
            {garden.crop_type}
          </span>
          <span>{garden.area_m2} m²</span>
        </div>
        {garden.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {garden.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-3">
          Tạo: {formatDate(garden.created_at)}
        </p>
      </div>
    </div>
  )
}

export default function GardensPage() {
  const [gardens, setGardens] = useState<Garden[]>([
    {
      id: 'garden_01',
      name: 'Vườn Sân Thượng',
      area_m2: 6,
      crop_type: 'Rau ăn lá',
      description: 'Khu vườn chính trên sân thượng nhà',
      cover_image_url: 'https://picsum.photos/id/177/400/300',
      device_count: 10,
      device_online: 9,
      created_at: '2026-01-15T00:00:00Z'
    },
    {
      id: 'garden_02',
      name: 'Vườn Ban Công',
      area_m2: 2,
      crop_type: 'Cà chua',
      description: 'Ban công hướng nam trồng cà chua bi',
      cover_image_url: 'https://picsum.photos/id/292/400/300',
      device_count: 8,
      device_online: 8,
      created_at: '2026-03-02T00:00:00Z'
    }
  ])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGarden, setEditingGarden] = useState<Garden | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleSave = (gardenData: Partial<Garden>) => {
    const garden = gardenData as Garden
    if (editingGarden) {
      setGardens((prev) => prev.map((g) => (g.id === garden.id ? garden : g)))
    } else {
      setGardens((prev) => [...prev, garden])
    }
    setEditingGarden(null)
  }

  const handleEdit = (garden: Garden) => {
    setEditingGarden(garden)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setGardens((prev) => prev.filter((g) => g.id !== id))
    setDeleteConfirm(null)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Quản lý đa vườn
          </h1>
          <p className="text-muted-foreground mt-1">
            Thêm và quản lý nhiều khu vườn của bạn
          </p>
        </div>
        <button
          onClick={() => { setEditingGarden(null); setIsModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm vườn</span>
        </button>
      </div>

      {/* Gardens Grid */}
      {gardens.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Chưa có vườn nào
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Bắt đầu bằng cách tạo vườn đầu tiên của bạn
          </p>
          <button
            onClick={() => { setEditingGarden(null); setIsModalOpen(true) }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            Thêm vườn
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gardens.map((garden) => (
            <GardenCard
              key={garden.id}
              garden={garden}
              onEdit={() => handleEdit(garden)}
              onDelete={() => setDeleteConfirm(garden.id)}
            />
          ))}
        </div>
      )}

      <GardenModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingGarden(null) }}
        onSave={handleSave}
        editingGarden={editingGarden}
      />

      <AlertDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Xóa vườn"
        description="Bạn có chắc chắn muốn xóa vườn này? Tất cả dữ liệu liên quan sẽ bị mất."
      />
    </div>
  )
}
