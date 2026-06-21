import { useState } from 'react'
import {
  ScrollText, Plus, Leaf, Bug, ShoppingBasket, Droplets,
  MoreVertical, Edit, Trash2, X, Thermometer, Waves, FlaskConical
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import { useAuth } from '@/contexts/AuthContext'
import type { FarmingLogEntry } from '@/types'

type LogType = 'fertilizing' | 'spraying' | 'harvesting' | 'manual_watering' | 'all'

interface LogFormData {
  type: LogType
  note: string
}

const LOG_TYPES: { value: LogType; label: string; icon: typeof Leaf; color: string; bgColor: string }[] = [
  { value: 'fertilizing', label: 'Bón phân', icon: Leaf, color: 'text-green-400', bgColor: 'bg-green-500' },
  { value: 'spraying', label: 'Phun thuốc', icon: Bug, color: 'text-orange-400', bgColor: 'bg-orange-500' },
  { value: 'harvesting', label: 'Thu hoạch', icon: ShoppingBasket, color: 'text-yellow-400', bgColor: 'bg-yellow-500' },
  { value: 'manual_watering', label: 'Tưới thủ công', icon: Droplets, color: 'text-blue-400', bgColor: 'bg-blue-500' },
]

export default function FarmingLogPage() {
  const { farmingLogs, addFarmingLog, deleteFarmingLog, latestSensorData } = useApp()
  const { user } = useAuth()
  const [typeFilter, setTypeFilter] = useState<LogType>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<FarmingLogEntry | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [formData, setFormData] = useState<LogFormData>({
    type: 'fertilizing',
    note: '',
  })

  const filteredLogs = farmingLogs.filter(log => {
    if (typeFilter === 'all') return true
    return log.type === typeFilter
  })

  const getLogTypeConfig = (type: FarmingLogEntry['type']) => {
    return LOG_TYPES.find(t => t.value === type) || LOG_TYPES[0]
  }

  const getTypeColor = (type: LogType) => {
    switch (type) {
      case 'fertilizing': return 'bg-green-500'
      case 'spraying': return 'bg-orange-500'
      case 'harvesting': return 'bg-yellow-500'
      case 'manual_watering': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleOpenModal = (log?: FarmingLogEntry) => {
    if (log) {
      setEditingLog(log)
      setFormData({ type: log.type, note: log.note })
    } else {
      setEditingLog(null)
      setFormData({ type: 'fertilizing', note: '' })
    }
    setIsModalOpen(true)
    setOpenMenuId(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingLog(null)
    setFormData({ type: 'fertilizing', note: '' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.note.trim()) return

    const logType = LOG_TYPES.find(t => t.value === formData.type)
    const sensorData = latestSensorData as { dht1?: { temp?: number }; soil1?: { moisture_pct?: number }; ph?: { ph_value?: number } }

    const newLog: FarmingLogEntry = {
      id: editingLog?.id || `log_${Date.now()}`,
      type: formData.type as FarmingLogEntry['type'],
      label: logType?.label || 'Nhật ký',
      timestamp: editingLog?.timestamp || new Date().toISOString(),
      note: formData.note,
      sensor_snapshot: {
        temp: sensorData.dht1?.temp || 0,
        soil_moisture: sensorData.soil1?.moisture_pct || 0,
        ph: sensorData.ph?.ph_value || 0,
      },
      created_by: user?.name || 'Unknown',
    }

    addFarmingLog(newLog)
    handleCloseModal()
  }

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa nhật ký này?')) {
      deleteFarmingLog(id)
      setOpenMenuId(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Nhật ký canh tác
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi các hoạt động chăm sóc vườn
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background'
          )}
        >
          <Plus className="w-5 h-5" />
          <span>Thêm nhật ký</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-card rounded-xl border border-border">
        <button
          onClick={() => setTypeFilter('all')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            typeFilter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          )}
        >
          Tất cả
        </button>
        {LOG_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setTypeFilter(type.value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              typeFilter === type.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <type.icon className={cn('w-4 h-4', typeFilter === type.value ? '' : type.color)} />
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filteredLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ScrollText className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg">Chưa có nhật ký nào</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 px-4 py-2 text-sm text-primary hover:text-primary/80"
          >
            Thêm nhật ký đầu tiên
          </button>
        </div>
      ) : (
        <div className="relative pl-8">
          {/* Vertical Line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />

          {/* Log Entries */}
          <div className="space-y-6">
            {filteredLogs.map((log) => {
              const typeConfig = getLogTypeConfig(log.type)
              return (
                <div key={log.id} className="relative">
                  {/* Dot */}
                  <div className={cn(
                    'absolute left-[-1.25rem] top-6 w-4 h-4 rounded-full border-2 border-background',
                    getTypeColor(log.type)
                  )} />

                  {/* Card */}
                  <div className="bg-card rounded-xl p-5 border border-border hover:border-primary/30 transition-colors">
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'p-2.5 rounded-lg',
                          typeConfig.bgColor,
                          'opacity-20'
                        )}>
                          <typeConfig.icon className={cn('w-5 h-5', typeConfig.color)} />
                        </div>
                        <div>
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                            getTypeColor(log.type),
                            'text-black'
                          )}>
                            {typeConfig.label}
                          </span>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(log.timestamp)} • {formatTime(log.timestamp)}
                          </p>
                        </div>
                      </div>

                      {/* Dropdown Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === log.id ? null : log.id)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {openMenuId === log.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-popover rounded-lg border border-border shadow-lg py-1 z-10">
                            <button
                              onClick={() => handleOpenModal(log)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Chỉnh sửa</span>
                            </button>
                            <button
                              onClick={() => handleDelete(log.id)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-accent transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Xóa</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Note */}
                    <p className="text-foreground mb-4">{log.note}</p>

                    {/* Sensor Snapshot */}
                    {log.sensor_snapshot && (
                      <div className="flex flex-wrap gap-3 p-3 bg-accent/30 rounded-lg mb-4">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Thermometer className="w-4 h-4 text-orange-400" />
                          <span className="text-muted-foreground">Nhiệt độ:</span>
                          <span className="font-medium text-foreground">{log.sensor_snapshot.temp}°C</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Waves className="w-4 h-4 text-blue-400" />
                          <span className="text-muted-foreground">Độ ẩm đất:</span>
                          <span className="font-medium text-foreground">{log.sensor_snapshot.soil_moisture}%</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <FlaskConical className="w-4 h-4 text-purple-400" />
                          <span className="text-muted-foreground">pH:</span>
                          <span className="font-medium text-foreground">{log.sensor_snapshot.ph}</span>
                        </div>
                      </div>
                    )}

                    {/* Created By */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs text-primary font-medium">
                          {log.created_by.charAt(0)}
                        </span>
                      </div>
                      <span>Người tạo: <span className="text-foreground">{log.created_by}</span></span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add/Edit Log Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="bg-card rounded-2xl w-full max-w-lg mx-4 border border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-heading font-semibold text-foreground">
                {editingLog ? 'Chỉnh sửa nhật ký' : 'Thêm nhật ký mới'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Type Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Loại hoạt động
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {LOG_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-lg border transition-colors',
                        formData.type === type.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <type.icon className={cn('w-4 h-4', type.color)} />
                      <span className="text-sm font-medium text-foreground">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Note Textarea */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Ghi chú
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Nhập ghi chú về hoạt động canh tác..."
                  rows={4}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    'resize-none transition-colors'
                  )}
                />
              </div>

              {/* Sensor Snapshot Info */}
              <div className="p-4 bg-accent/30 rounded-lg space-y-2">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Thông số cảm biến tự động ghi nhận
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-orange-400" />
                    <span className="text-muted-foreground">Nhiệt độ:</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {(latestSensorData as { dht1?: { temp?: number } })?.dht1?.temp || 0}°C
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Waves className="w-4 h-4 text-blue-400" />
                    <span className="text-muted-foreground">Độ ẩm đất:</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {(latestSensorData as { soil1?: { moisture_pct?: number } })?.soil1?.moisture_pct || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-purple-400" />
                    <span className="text-muted-foreground">pH:</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {(latestSensorData as { ph?: { ph_value?: number } })?.ph?.ph_value || 0}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={cn(
                    'px-5 py-2.5 rounded-lg font-medium transition-colors',
                    'border border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!formData.note.trim()}
                  className={cn(
                    'px-5 py-2.5 rounded-lg font-medium transition-colors',
                    'bg-primary text-primary-foreground hover:bg-primary/90',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {editingLog ? 'Lưu thay đổi' : 'Thêm nhật ký'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setOpenMenuId(null)}
        />
      )}
    </div>
  )
}
