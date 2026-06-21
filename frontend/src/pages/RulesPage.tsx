import { useState } from 'react'
import { z } from 'zod'
import { Plus, Pencil, Trash2, X, Zap, Check, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import type { Rule } from '@/types'

const ruleSchema = z.object({
  name: z.string().min(1, 'Tên quy tắc là bắt buộc'),
  sensor: z.string().min(1, 'Cảm biến là bắt buộc'),
  operator: z.enum(['<', '>', '=', '<=', '>=']),
  value: z.number().min(0, 'Giá trị phải lớn hơn 0'),
  device: z.string().min(1, 'Thiết bị là bắt buộc'),
  action: z.enum(['ON', 'OFF']),
})

type RuleFormData = z.infer<typeof ruleSchema>

const SENSORS = [
  { value: 'soil1', label: 'Độ ẩm đất Zone 1' },
  { value: 'soil2', label: 'Độ ẩm đất Zone 2' },
  { value: 'temperature', label: 'Nhiệt độ' },
  { value: 'humidity', label: 'Độ ẩm không khí' },
  { value: 'light', label: 'Cường độ ánh sáng' },
  { value: 'ph', label: 'pH' },
]

const DEVICES = [
  { value: 'pump', label: 'Máy bơm' },
  { value: 'fan', label: 'Quạt thông gió' },
  { value: 'light', label: 'Đèn LED' },
  { value: 'shade', label: 'Mái che' },
]

const OPERATORS = [
  { value: '<', label: '<' },
  { value: '>', label: '>' },
  { value: '=', label: '=' },
  { value: '<=', label: '<=' },
  { value: '>=', label: '>=' },
]

interface RuleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (rule: Rule) => void
  editingRule: Rule | null
}

function RuleModal({ isOpen, onClose, onSave, editingRule }: RuleModalProps) {
  const [formData, setFormData] = useState<RuleFormData>({
    name: editingRule?.name || '',
    sensor: editingRule?.sensor || '',
    operator: editingRule?.operator || '<',
    value: editingRule?.value || 0,
    device: editingRule?.device || '',
    action: editingRule?.action || 'ON',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof RuleFormData, string>>>({})
  const [showTestResult, setShowTestResult] = useState<string | null>(null)

  const handleChange = (field: keyof RuleFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setShowTestResult(null)
  }

  const handleTest = () => {
    const result = ruleSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RuleFormData, string>> = {}
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof RuleFormData
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message
        }
      })
      setErrors(fieldErrors)
      setShowTestResult('Điều kiện hiện chưa thỏa mãn — sẽ không kích hoạt')
      return
    }

    const sensorLabels: Record<string, string> = {
      soil1: '42%',
      soil2: '55%',
      temperature: '31°C',
      humidity: '68%',
      light: '25000 lux',
      ph: '6.4',
    }

    const currentValue = sensorLabels[formData.sensor] || 'N/A'
    let conditionMet = false

    const numericValue = formData.value
    const mockSensorValues: Record<string, number> = {
      soil1: 42,
      soil2: 55,
      temperature: 31,
      humidity: 68,
      light: 25000,
      ph: 6.4,
    }
    const currentSensorValue = mockSensorValues[formData.sensor] || 0

    switch (formData.operator) {
      case '<': conditionMet = currentSensorValue < numericValue; break
      case '>': conditionMet = currentSensorValue > numericValue; break
      case '=': conditionMet = currentSensorValue === numericValue; break
      case '<=': conditionMet = currentSensorValue <= numericValue; break
      case '>=': conditionMet = currentSensorValue >= numericValue; break
    }

    if (conditionMet) {
      setShowTestResult(`Điều kiện đã thỏa mãn! (${currentValue} ${formData.operator} ${formData.value})`)
    } else {
      setShowTestResult(`Điều kiện hiện chưa thỏa mãn — sẽ không kích hoạt (${currentValue} ${formData.operator} ${formData.value})`)
    }
  }

  const handleSubmit = () => {
    const result = ruleSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RuleFormData, string>> = {}
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof RuleFormData
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    const rule: Rule = {
      id: editingRule?.id || `rule_${Date.now()}`,
      name: formData.name,
      sensor: formData.sensor,
      operator: formData.operator,
      value: formData.value,
      device: formData.device,
      action: formData.action,
      enabled: editingRule?.enabled ?? true,
    }

    onSave(rule)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-2xl border border-border w-full max-w-lg mx-4 animate-slide-down">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            {editingRule ? 'Chỉnh sửa quy tắc' : 'Thêm quy tắc mới'}
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
            <label className="text-sm font-medium text-foreground">Tên quy tắc</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="VD: Tưới khi đất khô"
              className={cn(
                'w-full px-3 py-2 rounded-lg bg-input border text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary',
                errors.name ? 'border-destructive' : 'border-border'
              )}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <h3 className="text-sm font-medium text-amber-500 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold">IF</span>
              Điều kiện kích hoạt
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Cảm biến</label>
                <select
                  value={formData.sensor}
                  onChange={(e) => handleChange('sensor', e.target.value)}
                  className={cn(
                    'w-full px-2 py-1.5 rounded-lg bg-input border text-foreground text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-primary',
                    errors.sensor ? 'border-destructive' : 'border-border'
                  )}
                >
                  <option value="">Chọn</option>
                  {SENSORS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Toán tử</label>
                <select
                  value={formData.operator}
                  onChange={(e) => handleChange('operator', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {OPERATORS.map((op) => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Giá trị</label>
                <input
                  type="number"
                  value={formData.value || ''}
                  onChange={(e) => handleChange('value', Number(e.target.value))}
                  placeholder="0"
                  className={cn(
                    'w-full px-2 py-1.5 rounded-lg bg-input border text-foreground text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-primary',
                    errors.value ? 'border-destructive' : 'border-border'
                  )}
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <h3 className="text-sm font-medium text-emerald-500 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold">THEN</span>
              Hành động thực hiện
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Thiết bị</label>
                <select
                  value={formData.device}
                  onChange={(e) => handleChange('device', e.target.value)}
                  className={cn(
                    'w-full px-2 py-1.5 rounded-lg bg-input border text-foreground text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-primary',
                    errors.device ? 'border-destructive' : 'border-border'
                  )}
                >
                  <option value="">Chọn</option>
                  {DEVICES.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Hành động</label>
                <select
                  value={formData.action}
                  onChange={(e) => handleChange('action', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ON">Bật</option>
                  <option value="OFF">Tắt</option>
                </select>
              </div>
            </div>
          </div>

          {showTestResult && (
            <div
              className={cn(
                'p-3 rounded-lg text-sm',
                showTestResult.includes('thỏa mãn') && !showTestResult.includes('chưa')
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              )}
            >
              {showTestResult}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
          <button
            onClick={handleTest}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Kiểm tra
          </button>
          <div className="flex items-center gap-2">
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
              {editingRule ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
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

export default function RulesPage() {
  const { rules, addRule, updateRule, deleteRule } = useApp()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const hasConflict = (rule: Rule): boolean => {
    return rules.some(
      (r) =>
        r.id !== rule.id &&
        r.enabled &&
        r.sensor === rule.sensor &&
        r.device === rule.device &&
        r.id !== rule.id
    )
  }

  const handleSave = (rule: Rule) => {
    if (editingRule) {
      updateRule(rule)
    } else {
      addRule(rule)
    }
    setEditingRule(null)
  }

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteRule(id)
    setDeleteConfirm(null)
  }

  const handleToggle = (rule: Rule) => {
    updateRule({ ...rule, enabled: !rule.enabled })
  }

  const getSensorLabel = (sensor: string) => {
    return SENSORS.find((s) => s.value === sensor)?.label || sensor
  }

  const getDeviceLabel = (device: string) => {
    return DEVICES.find((d) => d.value === device)?.label || device
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Smart Rule Engine
          </h1>
          <p className="text-muted-foreground mt-1">
            Tạo và quản lý các quy tắc tự động hóa cho vườn thông minh
          </p>
        </div>
        <button
          onClick={() => { setEditingRule(null); setIsModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm quy tắc</span>
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Chưa có quy tắc nào
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tạo quy tắc đầu tiên để tự động hóa các thiết bị
            </p>
            <button
              onClick={() => { setEditingRule(null); setIsModalOpen(true) }}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              Thêm quy tắc
            </button>
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className={cn(
                'bg-card rounded-xl border transition-all',
                rule.enabled ? 'border-border' : 'border-border/50 opacity-75'
              )}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                        rule.enabled ? 'bg-primary/10' : 'bg-muted'
                      )}
                    >
                      <Zap className={cn('w-5 h-5', rule.enabled ? 'text-primary' : 'text-muted-foreground')} />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{rule.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {rule.enabled ? 'Đang hoạt động' : 'Đã tắt'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(rule)}
                      className={cn(
                        'relative w-11 h-6 rounded-full transition-colors',
                        rule.enabled ? 'bg-primary' : 'bg-muted'
                      )}
                    >
                      <div
                        className={cn(
                          'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
                          rule.enabled ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </button>
                    <button
                      onClick={() => handleEdit(rule)}
                      className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(rule.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-500 font-medium">
                      IF
                    </span>
                    <span className="text-muted-foreground">
                      Nếu <span className="text-foreground font-medium">{getSensorLabel(rule.sensor)}</span>{' '}
                      {rule.operator} <span className="text-foreground font-medium">{rule.value}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 font-medium">
                      THEN
                    </span>
                    <span className="text-muted-foreground">
                      <span className="text-foreground font-medium">
                        {rule.action === 'ON' ? 'Bật' : 'Tắt'} {getDeviceLabel(rule.device)}
                      </span>
                    </span>
                  </div>
                </div>

                {hasConflict(rule) && (
                  <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Cảnh báo: Quy tắc này có thể xung đột với quy tắc khác
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <RuleModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingRule(null) }}
        onSave={handleSave}
        editingRule={editingRule}
      />

      <AlertDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Xóa quy tắc"
        description="Bạn có chắc chắn muốn xóa quy tắc này? Hành động này không thể hoàn tác."
      />
    </div>
  )
}
