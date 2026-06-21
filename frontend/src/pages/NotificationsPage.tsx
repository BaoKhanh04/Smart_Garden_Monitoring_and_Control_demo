import { useState, useMemo } from 'react'
import { useApp } from '@/contexts/AppContext'
import { cn } from '@/lib/utils'
import { Bell, AlertTriangle, AlertCircle, Info, X, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Notification } from '@/types'

type FilterTab = 'all' | 'critical' | 'warning' | 'info'

const ITEMS_PER_PAGE = 10

export default function NotificationsPage() {
  const { notifications, unreadCount, markNotificationRead, dismissNotification } = useApp()
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications
    return notifications.filter((n) => n.level === activeTab)
  }, [notifications, activeTab])

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredNotifications.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredNotifications, currentPage])

  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE)

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const getLevelIcon = (level: Notification['level']) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-400" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getLevelBadgeStyles = (level: Notification['level']) => {
    switch (level) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'warning':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'info':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
  }

  const getSourceBadgeStyle = (source: string) => {
    const sourceColors: Record<string, string> = {
      soil1: 'bg-emerald-500/20 text-emerald-400',
      soil2: 'bg-emerald-500/20 text-emerald-400',
      disease: 'bg-purple-500/20 text-purple-400',
      weather: 'bg-sky-500/20 text-sky-400',
      system: 'bg-gray-500/20 text-gray-400',
      mqtt_broker: 'bg-orange-500/20 text-orange-400',
    }
    return sourceColors[source] || 'bg-gray-500/20 text-gray-400'
  }

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays === 1) return 'Hôm qua'
    if (diffDays < 7) return `${diffDays} ngày trước`

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getLevelLabel = (level: Notification['level']) => {
    switch (level) {
      case 'critical':
        return 'Nguy cấp'
      case 'warning':
        return 'Cảnh báo'
      case 'info':
        return 'Thông tin'
    }
  }

  const getSourceLabel = (source: string) => {
    const sourceLabels: Record<string, string> = {
      soil1: 'Cảm biến đất 1',
      soil2: 'Cảm biến đất 2',
      disease: 'AI Bệnh cây',
      weather: 'Thời tiết',
      system: 'Hệ thống',
      mqtt_broker: 'MQTT Broker',
    }
    return sourceLabels[source] || source
  }

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'critical', label: 'Nguy cấp', count: notifications.filter((n) => n.level === 'critical').length },
    { key: 'warning', label: 'Cảnh báo', count: notifications.filter((n) => n.level === 'warning').length },
    { key: 'info', label: 'Thông tin', count: notifications.filter((n) => n.level === 'info').length },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Thông báo</h1>
          {unreadCount > 0 && (
            <span className="px-2.5 py-1 text-sm font-medium bg-primary text-primary-foreground rounded-full">
              {unreadCount} chưa đọc
            </span>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg border transition-all',
              activeTab === tab.key
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-card/80'
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  'ml-2 px-2 py-0.5 text-xs rounded-full',
                  activeTab === tab.key
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {paginatedNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Bell className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg">Không có thông báo nào</p>
          </div>
        ) : (
          paginatedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'p-4 bg-card rounded-xl border transition-all',
                notification.read
                  ? 'border-border/50 opacity-75'
                  : 'border-border shadow-sm'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getLevelIcon(notification.level)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {/* Level Badge */}
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 text-xs font-medium rounded-full border',
                        getLevelBadgeStyles(notification.level)
                      )}
                    >
                      {getLevelLabel(notification.level)}
                    </span>

                    {/* Source Badge */}
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 text-xs font-medium rounded-full',
                        getSourceBadgeStyle(notification.source)
                      )}
                    >
                      {getSourceLabel(notification.source)}
                    </span>

                    {/* Timestamp */}
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(notification.timestamp)}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-sm text-foreground leading-relaxed">
                    {notification.message}
                  </p>

                  {/* Suggested Action */}
                  {notification.suggested_action && (
                    <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-3">
                      <button
                        className={cn(
                          'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                          notification.read
                            ? 'bg-secondary/50 text-secondary-foreground hover:bg-secondary'
                            : 'bg-primary/20 text-primary hover:bg-primary/30'
                        )}
                      >
                        {notification.suggested_action.label}
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!notification.read && (
                    <button
                      onClick={() => markNotificationRead(notification.id)}
                      className="p-2 rounded-lg hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
                      title="Đánh dấu đã đọc"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => dismissNotification(notification.id)}
                    className="p-2 rounded-lg hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
                    title="Xóa thông báo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-border">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={cn(
              'p-2 rounded-lg border transition-colors',
              currentPage === 1
                ? 'border-border/50 text-muted-foreground/50 cursor-not-allowed'
                : 'border-border text-muted-foreground hover:bg-card hover:text-foreground'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const showPage =
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1

              if (!showPage && page === currentPage - 2) {
                return (
                  <span key={`ellipsis-${page}`} className="px-2 text-muted-foreground">
                    ...
                  </span>
                )
              }
              if (!showPage && page === currentPage + 2) {
                return (
                  <span key={`ellipsis-${page}`} className="px-2 text-muted-foreground">
                    ...
                  </span>
                )
              }
              if (!showPage) return null

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                    currentPage === page
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-muted-foreground hover:bg-background'
                  )}
                >
                  {page}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={cn(
              'p-2 rounded-lg border transition-colors',
              currentPage === totalPages
                ? 'border-border/50 text-muted-foreground/50 cursor-not-allowed'
                : 'border-border text-muted-foreground hover:bg-card hover:text-foreground'
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
