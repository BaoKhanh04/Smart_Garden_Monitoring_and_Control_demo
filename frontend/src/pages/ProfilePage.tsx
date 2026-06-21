import { useState } from 'react'
import { Camera, Save, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [isDirty, setIsDirty] = useState(false)
  const [showSaveToast, setShowSaveToast] = useState(false)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handleNameChange = (value: string) => {
    setName(value)
    setIsDirty(value !== user?.name)
  }

  const handleSaveProfile = () => {
    if (name.trim()) {
      updateUser({ name: name.trim() })
      setIsDirty(false)
      setShowSaveToast(true)
      setTimeout(() => setShowSaveToast(false), 3000)
    }
  }

  const handleChangePassword = () => {
    setPasswordError('')
    setPasswordSuccess(false)

    if (!currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('Mật khẩu mới phải có ít nhất 8 ký tự')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp')
      return
    }

    // Mock password change
    setPasswordSuccess(true)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setPasswordSuccess(false), 3000)
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER': return 'Chủ sở hữu'
      case 'MEMBER': return 'Thành viên'
      default: return role
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-amber-500/10 text-amber-500'
      case 'MEMBER': return 'bg-blue-500/10 text-blue-500'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Toast */}
      <div
        className={cn(
          'fixed top-4 right-4 z-50 px-4 py-3 rounded-lg bg-primary text-primary-foreground shadow-lg',
          'flex items-center gap-2 font-medium transition-all duration-300',
          showSaveToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        )}
      >
        <Check className="w-5 h-5" />
        <span>Đã lưu thông tin thành công!</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Hồ sơ cá nhân
        </h1>
        <p className="text-muted-foreground mt-1">
          Quản lý thông tin tài khoản của bạn
        </p>
      </div>

      {/* Avatar Section */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}&backgroundColor=0a5f38&textColor=ffffff`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md"
              title="Đổi avatar"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {user?.name || 'Người dùng'}
            </h2>
            <span className={cn(
              'inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium',
              getRoleBadgeColor(user?.role || 'MEMBER')
            )}>
              {getRoleLabel(user?.role || 'MEMBER')}
            </span>
            <p className="text-sm text-muted-foreground mt-2">
              {user?.email || 'email@example.com'}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Thông tin cá nhân</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Họ và tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="Nhập họ và tên"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              disabled
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Vai trò</label>
            <div className={cn(
              'inline-flex px-3 py-2 rounded-lg text-sm font-medium',
              getRoleBadgeColor(user?.role || 'MEMBER')
            )}>
              {getRoleLabel(user?.role || 'MEMBER')}
            </div>
            <p className="text-xs text-muted-foreground">Vai trò được gán bởi chủ sở hữu</p>
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={!isDirty}
          className={cn(
            'mt-6 flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm',
            'bg-primary text-primary-foreground',
            'hover:bg-primary/90',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200'
          )}
        >
          <Save className="w-4 h-4" />
          <span>Lưu thay đổi</span>
        </button>
      </div>

      {/* Change Password Section */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Đổi mật khẩu</h3>

        {passwordSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm animate-fade-in">
            Đổi mật khẩu thành công!
          </div>
        )}

        {passwordError && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
            {passwordError}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
        </div>

        <button
          onClick={handleChangePassword}
          className={cn(
            'mt-6 flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm',
            'bg-primary text-primary-foreground',
            'hover:bg-primary/90',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card',
            'transition-all duration-200'
          )}
        >
          <Save className="w-4 h-4" />
          <span>Đổi mật khẩu</span>
        </button>
      </div>
    </div>
  )
}
