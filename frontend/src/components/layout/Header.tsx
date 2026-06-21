import { Link, useLocation } from 'react-router-dom'
import {
  ChevronDown,
  Bell,
  LogOut,
  User,
  Check,
  Moon,
  Sun,
  type LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useApp } from '@/contexts/AppContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useState, useRef, useEffect } from 'react'
import type { Notification } from '@/types'

const pageTitleMap: Record<string, string> = {
  '/dashboard/overview': 'Tổng quan',
  '/dashboard/control': 'Điều khiển thiết bị',
  '/dashboard/irrigation': 'Lịch tưới',
  '/dashboard/disease-detection': 'Phát hiện bệnh',
  '/dashboard/disease-risk': 'Dự đoán nguy cơ',
  '/dashboard/recommendations': 'Gợi ý AI',
  '/dashboard/analytics': 'Phân tích lịch sử',
  '/dashboard/water-usage': 'Tiêu thụ nước',
  '/dashboard/power-monitoring': 'Tiêu thụ điện',
  '/dashboard/harvest-prediction': 'Dự đoán thu hoạch',
  '/dashboard/growth-tracking': 'Theo dõi tăng trưởng',
  '/dashboard/photo-gallery': 'Thư viện ảnh',
  '/dashboard/camera': 'Camera',
  '/dashboard/weather': 'Thời tiết',
  '/dashboard/farming-log': 'Nhật ký',
  '/dashboard/notifications': 'Thông báo',
  '/settings/profile': 'Hồ sơ',
  '/settings/members': 'Thành viên',
  '/settings/thresholds': 'Ngưỡng',
  '/settings/rules': 'Smart Rule',
  '/settings/device-health': 'Tình trạng thiết bị',
  '/settings/gardens': 'Đa vườn',
}

const levelColors: Record<Notification['level'], { bg: string; text: string; dot: string }> = {
  critical: { bg: 'bg-destructive/10', text: 'text-destructive', dot: 'bg-destructive' },
  warning: { bg: 'bg-amber-500/10', text: 'text-amber-500', dot: 'bg-amber-500' },
  info: { bg: 'bg-blue-500/10', text: 'text-blue-500', dot: 'bg-blue-500' },
}

interface DropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
}

function Dropdown({ trigger, children, align = 'right' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          className={cn(
            'absolute top-full mt-2 z-50 min-w-[220px]',
            'bg-popover border border-border rounded-lg shadow-xl',
            'animate-slide-down',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

interface DropdownItemProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

function DropdownItem({ children, onClick, disabled, className }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 text-sm',
        'transition-colors duration-150',
        disabled
          ? 'opacity-50 cursor-not-allowed text-muted-foreground'
          : 'hover:bg-accent text-foreground',
        className
      )}
    >
      {children}
    </button>
  )
}

function DropdownSeparator() {
  return <div className="my-1 h-px bg-border" />
}

export default function Header() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const { gardens, activeGarden, setActiveGarden, notifications, unreadCount, markNotificationRead } = useApp()
  const { theme, toggleTheme } = useTheme()

  const pageTitle = pageTitleMap[location.pathname] || 'Smart Garden'

  const latestNotifications = notifications.slice(0, 5)

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins}p trước`
    if (diffHours < 24) return `${diffHours}g trước`
    return `${diffDays}ngày trước`
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-[260px] right-0 h-16',
        'bg-background/80 backdrop-blur-md',
        'border-b border-border',
        'flex items-center justify-between px-6',
        'z-40'
      )}
    >
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground font-heading">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'p-2 rounded-lg transition-all duration-200',
            'bg-card hover:bg-accent border border-border',
            'flex items-center justify-center'
          )}
          title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-400" />
          )}
        </button>

        <Dropdown
          trigger={
            <button
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg',
                'bg-card hover:bg-accent transition-colors duration-150',
                'border border-border'
              )}
            >
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-medium text-foreground">
                {activeGarden?.name || 'Chọn vườn'}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          }
        >
          {gardens.map((garden) => (
            <DropdownItem
              key={garden.id}
              onClick={() => {
                setActiveGarden(garden)
              }}
              className={cn(
                activeGarden?.id === garden.id && 'bg-primary/10 text-primary'
              )}
            >
              <div className="flex-1">
                <p className="font-medium">{garden.name}</p>
                <p className="text-xs text-muted-foreground">
                  {garden.crop_type} • {garden.device_online}/{garden.device_count} thiết bị online
                </p>
              </div>
              {activeGarden?.id === garden.id && (
                <Check className="w-4 h-4 text-primary shrink-0" />
              )}
            </DropdownItem>
          ))}
        </Dropdown>

        <Dropdown
          trigger={
            <button
              className={cn(
                'relative p-2 rounded-lg',
                'bg-card hover:bg-accent transition-colors duration-150',
                'border border-border'
              )}
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span
                  className={cn(
                    'absolute -top-1 -right-1 min-w-[18px] h-[18px]',
                    'flex items-center justify-center',
                    'text-[10px] font-bold text-primary-foreground',
                    'bg-primary rounded-full px-1'
                  )}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          }
          align="right"
        >
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-semibold">Thông báo</p>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {unreadCount} chưa đọc
              </p>
            )}
          </div>
          {latestNotifications.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Không có thông báo
            </div>
          ) : (
            latestNotifications.map((notification) => {
              const colors = levelColors[notification.level]
              return (
                <DropdownItem
                  key={notification.id}
                  onClick={() => markNotificationRead(notification.id)}
                  className={cn(
                    'flex items-start gap-3 py-3',
                    !notification.read && colors.bg
                  )}
                >
                  <span className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', colors.dot)} />
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm', notification.read ? 'text-muted-foreground' : colors.text)}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {notification.source} • {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </DropdownItem>
              )
            })
          )}
          {notifications.length > 5 && (
            <>
              <DropdownSeparator />
              <Link
                to="/dashboard/notifications"
                className="block px-3 py-2 text-sm text-center text-primary hover:bg-accent transition-colors"
              >
                Xem tất cả ({notifications.length})
              </Link>
            </>
          )}
        </Dropdown>

        <div className="w-px h-8 bg-border mx-1" />

        <Dropdown
          trigger={
            <button
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                'hover:bg-accent transition-colors duration-150'
              )}
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-foreground leading-tight">
                  {user?.name || 'User'}
                </p>
                <span
                  className={cn(
                    'inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded',
                    user?.role === 'OWNER'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-blue-500/20 text-blue-400'
                  )}
                >
                  {user?.role === 'OWNER' ? 'CHỦ VƯỜN' : 'THÀNH VIÊN'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
            </button>
          }
          align="right"
        >
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Link to="/settings/profile">
            <DropdownItem>
              <User className="w-4 h-4" />
              <span>Hồ sơ</span>
            </DropdownItem>
          </Link>
          <DropdownSeparator />
          <DropdownItem onClick={logout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  )
}
