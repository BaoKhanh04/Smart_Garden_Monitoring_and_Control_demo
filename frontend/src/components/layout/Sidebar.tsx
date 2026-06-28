import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Camera,
  CloudSun,
  Activity,
  Settings,
  SlidersHorizontal,
  ScrollText,
  Package2,
  Leaf,
  Droplets,
  Bug,
  TrendingUp,
  Zap,
  BarChart3,
  Lightbulb,
  TreePine,
  Image as Gallery,
  User,
  Users,
  Workflow,
  Brain,
  type LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const PlantIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-primary"
  >
    <path
      d="M12 22V12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 12C12 12 7 10 7 5C7 5 12 6 12 12Z"
      fill="currentColor"
      fillOpacity="0.3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 12C12 12 17 10 17 5C17 5 12 6 12 12Z"
      fill="currentColor"
      fillOpacity="0.3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 22H17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M9 18C9 18 10.5 19.5 12 19.5C13.5 19.5 15 18 15 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const navGroups: NavGroup[] = [
  {
    title: 'GIÁM SÁT',
    items: [
      { label: 'Tổng quan', path: '/dashboard/overview', icon: LayoutDashboard },
      { label: 'Camera', path: '/dashboard/camera', icon: Camera },
      { label: 'Thời tiết', path: '/dashboard/weather', icon: CloudSun },
      { label: 'Tình trạng thiết bị', path: '/settings/device-health', icon: Activity },
    ],
  },
  {
    title: 'ĐIỀU KHIỂN',
    items: [
      { label: 'Điều khiển thiết bị', path: '/dashboard/control', icon: Settings },
      { label: 'Lịch tưới', path: '/dashboard/irrigation', icon: Droplets },
      { label: 'Nhật ký', path: '/dashboard/farming-log', icon: ScrollText },
    ],
  },
  {
    title: 'PHÂN TÍCH & AI',
    items: [
      { label: 'Phát hiện bệnh', path: '/dashboard/disease-detection', icon: Bug },
      { label: 'Dự đoán nguy cơ', path: '/dashboard/disease-risk', icon: TrendingUp },
      { label: 'Gợi ý AI', path: '/dashboard/recommendations', icon: Lightbulb },
      { label: 'Tưới nước bằng AI', path: '/dashboard/ai-irrigation', icon: Brain },
      { label: 'Phân tích lịch sử', path: '/dashboard/analytics', icon: BarChart3 },
      { label: 'Tiêu thụ nước', path: '/dashboard/water-usage', icon: Droplets },
      { label: 'Tiêu thụ điện', path: '/dashboard/power-monitoring', icon: Zap },
      { label: 'Dự đoán thu hoạch', path: '/dashboard/harvest-prediction', icon: TreePine },
      { label: 'Theo dõi tăng trưởng', path: '/dashboard/growth-tracking', icon: Leaf },
      { label: 'Thư viện ảnh', path: '/dashboard/photo-gallery', icon: Gallery },
    ],
  },
  {
    title: 'CÀI ĐẶT',
    items: [
      { label: 'Hồ sơ', path: '/settings/profile', icon: User },
      { label: 'Thành viên', path: '/settings/members', icon: Users },
      { label: 'Ngưỡng', path: '/settings/thresholds', icon: SlidersHorizontal },
      { label: 'Smart Rule', path: '/settings/rules', icon: Workflow },
      { label: 'Đa vườn', path: '/settings/gardens', icon: Package2 },
    ],
  },
]

const ownerOnlyPaths = ['/settings/members', '/settings/thresholds', '/settings/rules', '/settings/gardens', '/dashboard/ai-irrigation', '/dashboard/disease-detection', '/dashboard/disease-risk', '/dashboard/recommendations', '/dashboard/analytics', '/dashboard/water-usage', '/dashboard/power-monitoring', '/dashboard/harvest-prediction']

export default function Sidebar() {
  const location = useLocation()
  const { user } = useAuth()

  const isOwner = user?.role === 'OWNER'

  const isActive = (path: string): boolean => {
    return location.pathname === path
  }

  const isGroupActive = (items: NavItem[]): boolean => {
    return items.some(item => location.pathname === item.path)
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen flex flex-col',
        'bg-background',
        'border-r border-border',
        'w-[260px]'
      )}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <PlantIcon />
        <span className="font-heading font-bold text-2xl text-primary tracking-tight">
          SGMC
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(item => {
            if (ownerOnlyPaths.includes(item.path)) {
              return isOwner
            }
            return true
          })

          if (visibleItems.length === 0) return null

          return (
            <div key={group.title} className="mb-4">
              <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 pt-4 pb-2">
                {group.title}
              </h3>
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                          'text-sm font-medium transition-colors duration-150',
                          'hover:bg-accent',
                          active
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-4 h-4 shrink-0',
                            active ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-primary">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || 'email@example.com'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
