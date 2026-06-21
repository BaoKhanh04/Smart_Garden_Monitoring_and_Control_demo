import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'
import { cn } from '@/lib/utils'
import {
  Zap,
  Gauge,
  Lightbulb,
  SunDim,
  AlertTriangle,
  Check,
  X,
  Loader2,
  Info,
  ArrowRight
} from 'lucide-react'

type SystemMode = 'auto' | 'manual' | 'fallback'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  deviceName: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

function ConfirmDialog({ isOpen, title, message, deviceName, onConfirm, onCancel, isLoading }: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-xl p-6 w-[400px] z-50 border border-border shadow-2xl animate-slide-down">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">Xác nhận thao tác</p>
          </div>
        </div>

        <p className="text-foreground/80 mb-6">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-border text-foreground/80 hover:bg-muted transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Xác nhận
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

interface RelayToggleProps {
  isOn: boolean
  onToggle: () => void
  disabled?: boolean
  loading?: boolean
}

function RelayToggle({ isOn, onToggle, disabled, loading }: RelayToggleProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled || loading}
      className={cn(
        'relative w-14 h-8 rounded-full transition-colors duration-200',
        isOn ? 'bg-primary' : 'bg-muted',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && !loading && 'cursor-pointer'
      )}
      role="switch"
      aria-checked={isOn}
    >
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
        </div>
      ) : (
        <div
          className={cn(
            'absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200',
            isOn ? 'translate-x-7' : 'translate-x-1'
          )}
        />
      )}
    </button>
  )
}

interface RelayCardProps {
  id: keyof { pump: boolean; fan: boolean; light: boolean; shade: boolean }
  name: string
  description: string
  icon: React.ReactNode
  isOn: boolean
  onToggle: () => void
  mode: SystemMode
  isLoading?: boolean
}

function RelayCard({ id, name, description, icon, isOn, onToggle, mode, isLoading }: RelayCardProps) {
  const isDisabled = mode !== 'manual'

  return (
    <div className={cn(
      'bg-card rounded-xl p-5 border transition-all duration-200',
      isOn ? 'border-primary/50' : 'border-border',
      isDisabled && 'opacity-80'
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          isOn ? 'bg-primary/10' : 'bg-muted'
        )}>
          <div className={cn(isOn ? 'text-primary' : 'text-muted-foreground')}>
            {icon}
          </div>
        </div>

        <RelayToggle
          isOn={isOn}
          onToggle={onToggle}
          disabled={isDisabled}
          loading={isLoading}
        />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-1">{name}</h3>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>

      <div className="flex items-center gap-2">
        <span className={cn(
          'px-2 py-1 rounded-full text-xs font-medium',
          isOn ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        )}>
          {isOn ? 'Bật' : 'Tắt'}
        </span>

        {isDisabled && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Chế độ {mode === 'auto' ? 'tự động' : mode === 'fallback' ? 'dự phòng' : 'thủ công'}
          </span>
        )}
      </div>

      {isDisabled && mode === 'auto' && (
        <p className="text-xs text-muted-foreground mt-2">
          Vườn đang được quản lý bởi AI
        </p>
      )}

      {isDisabled && mode === 'fallback' && (
        <div className="mt-2 flex items-center gap-1 text-amber-400">
          <AlertTriangle className="w-3 h-3" />
          <span className="text-xs">Chế độ dự phòng</span>
        </div>
      )}
    </div>
  )
}

interface ModeButtonProps {
  mode: SystemMode
  currentMode: SystemMode
  onClick: () => void
  disabled?: boolean
}

function ModeButton({ mode, currentMode, onClick, disabled }: ModeButtonProps) {
  const isActive = currentMode === mode

  const labels: Record<SystemMode, string> = {
    auto: 'Tự động',
    manual: 'Thủ công',
    fallback: 'Dự phòng'
  }

  const descriptions: Record<SystemMode, string> = {
    auto: 'AI quản lý',
    manual: 'Người dùng kiểm soát',
    fallback: 'Khi có sự cố'
  }

  const icons: Record<SystemMode, React.ReactNode> = {
    auto: <Zap className="w-4 h-4" />,
    manual: <Gauge className="w-4 h-4" />,
    fallback: <AlertTriangle className="w-4 h-4" />
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex-1 p-4 rounded-xl border transition-all duration-200 text-left',
        isActive
          ? 'border-primary bg-primary/10'
          : 'border-border bg-card hover:border-primary/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>
          {icons[mode]}
        </span>
        <span className={cn(
          'font-medium',
          isActive ? 'text-primary' : 'text-foreground'
        )}>
          {labels[mode]}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{descriptions[mode]}</p>
    </button>
  )
}

export default function ControlPage() {
  const { relayStatus, setRelayStatus } = useApp()
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    deviceId: keyof { pump: boolean; fan: boolean; light: boolean; shade: boolean } | null
    deviceName: string
    action: 'on' | 'off'
    loading: boolean
  }>({
    isOpen: false,
    deviceId: null,
    deviceName: '',
    action: 'off',
    loading: false
  })

  const handleModeChange = useCallback((newMode: SystemMode) => {
    setRelayStatus({ ...relayStatus, mode: newMode })
  }, [relayStatus, setRelayStatus])

  const handleToggleRequest = useCallback((deviceId: keyof { pump: boolean; fan: boolean; light: boolean; shade: boolean }, deviceName: string) => {
    if (relayStatus.mode !== 'manual') return

    const currentState = relayStatus.relays[deviceId]
    setConfirmDialog({
      isOpen: true,
      deviceId,
      deviceName,
      action: currentState ? 'off' : 'on',
      loading: false
    })
  }, [relayStatus])

  const handleConfirmToggle = useCallback(() => {
    if (!confirmDialog.deviceId) return

    setConfirmDialog(prev => ({ ...prev, loading: true }))

    setTimeout(() => {
      const newStatus = !relayStatus.relays[confirmDialog.deviceId!]
      setRelayStatus({
        ...relayStatus,
        relays: {
          ...relayStatus.relays,
          [confirmDialog.deviceId!]: newStatus
        }
      })

      setConfirmDialog({
        isOpen: false,
        deviceId: null,
        deviceName: '',
        action: 'off',
        loading: false
      })
    }, 1000)
  }, [confirmDialog, relayStatus, setRelayStatus])

  const handleCancelToggle = useCallback(() => {
    setConfirmDialog({
      isOpen: false,
      deviceId: null,
      deviceName: '',
      action: 'off',
      loading: false
    })
  }, [])

  const relays = [
    {
      id: 'pump' as const,
      name: 'Máy bơm',
      description: 'Hệ thống tưới nước tự động',
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 'fan' as const,
      name: 'Quạt thông gió',
      description: 'Điều hòa không khí, giảm nhiệt',
      icon: <Gauge className="w-6 h-6" />
    },
    {
      id: 'light' as const,
      name: 'Đèn LED',
      description: 'Chiếu sáng bổ sung cho cây trồng',
      icon: <Lightbulb className="w-6 h-6" />
    },
    {
      id: 'shade' as const,
      name: 'Mái che',
      description: 'Lưới che nắng, giảm cường độ ánh sáng',
      icon: <SunDim className="w-6 h-6" />
    }
  ]

  const modeLabels: Record<SystemMode, string> = {
    auto: 'Tự động',
    manual: 'Thủ công',
    fallback: 'Dự phòng'
  }

  const modeColors: Record<SystemMode, string> = {
    auto: 'bg-emerald-500/10 text-emerald-400',
    manual: 'bg-blue-500/10 text-blue-400',
    fallback: 'bg-amber-500/10 text-amber-400'
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-heading">Điều khiển thiết bị</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bật/tắt thiết bị và thay đổi chế độ hoạt động của hệ thống
          </p>
        </div>
        <span className={cn(
          'px-3 py-1 rounded-full text-sm font-medium',
          modeColors[relayStatus.mode]
        )}>
          Chế độ: {modeLabels[relayStatus.mode]}
        </span>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Chế độ hệ thống</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Chọn cách thức điều khiển hệ thống. Chế độ Tự động sử dụng AI để quản lý thiết bị.
        </p>

        <div className="grid grid-cols-3 gap-4">
          <ModeButton
            mode="auto"
            currentMode={relayStatus.mode}
            onClick={() => handleModeChange('auto')}
          />
          <ModeButton
            mode="manual"
            currentMode={relayStatus.mode}
            onClick={() => handleModeChange('manual')}
          />
          <ModeButton
            mode="fallback"
            currentMode={relayStatus.mode}
            onClick={() => handleModeChange('fallback')}
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Thiết bị</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relays.map((relay) => (
            <RelayCard
              key={relay.id}
              id={relay.id}
              name={relay.name}
              description={relay.description}
              icon={relay.icon}
              isOn={relayStatus.relays[relay.id]}
              onToggle={() => handleToggleRequest(relay.id, relay.name)}
              mode={relayStatus.mode}
              isLoading={confirmDialog.isOpen && confirmDialog.deviceId === relay.id ? confirmDialog.loading : undefined}
            />
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Trạng thái hiện tại</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {relays.map((relay) => (
            <div
              key={relay.id}
              className={cn(
                'p-4 rounded-lg border transition-colors',
                relayStatus.relays[relay.id]
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-border bg-muted/50'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  relayStatus.relays[relay.id] ? 'bg-primary' : 'bg-muted-foreground'
                )} />
                <span className="text-sm font-medium text-foreground">{relay.name}</span>
              </div>
              <span className={cn(
                'text-2xl font-bold',
                relayStatus.relays[relay.id] ? 'text-primary' : 'text-muted-foreground'
              )}>
                {relayStatus.relays[relay.id] ? 'ON' : 'OFF'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.action === 'on' ? 'Bật thiết bị' : 'Tắt thiết bị'}
        message={`Bạn có chắc chắn muốn ${confirmDialog.action === 'on' ? 'bật' : 'tắt'} ${confirmDialog.deviceName} không?`}
        deviceName={confirmDialog.deviceName}
        onConfirm={handleConfirmToggle}
        onCancel={handleCancelToggle}
        isLoading={confirmDialog.loading}
      />

      <div className="bg-muted/30 rounded-xl p-4 border border-border">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong className="text-foreground">Chế độ Tự động:</strong> Hệ thống AI sẽ tự động quản lý các thiết bị dựa trên dữ liệu cảm biến và quy tắc đã cấu hình. Bạn không thể bật/tắt thiết bị thủ công.
            </p>
            <p>
              <strong className="text-foreground">Chế độ Thủ công:</strong> Bạn có toàn quyền kiểm soát các thiết bị. Mỗi thao tác bật/tắt cần được xác nhận để tránh nhầm lẫn.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
