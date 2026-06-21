import { useState } from 'react'
import { Send, MoreVertical, AlertTriangle, UserPlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Member } from '@/types'

const MOCK_MEMBERS: Member[] = [
  {
    id: 1,
    name: 'Nguyễn Thành Đạt',
    email: 'owner@sgmc.com',
    role: 'OWNER',
    joined_at: '2026-01-15T00:00:00Z',
    garden_access: ['garden_01', 'garden_02']
  },
  {
    id: 2,
    name: 'Trần Thị Lan',
    email: 'member@sgmc.com',
    role: 'MEMBER',
    joined_at: '2026-02-20T00:00:00Z',
    garden_access: ['garden_01']
  },
  {
    id: 3,
    name: 'Lê Hoàng Nam',
    email: 'nam.lh@email.com',
    role: 'MEMBER',
    joined_at: '2026-04-10T00:00:00Z',
    garden_access: ['garden_01', 'garden_02']
  }
]

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

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'OWNER' | 'MEMBER'>('MEMBER')
  const [emailError, setEmailError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [revokeConfirm, setRevokeConfirm] = useState<number | null>(null)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleInvite = () => {
    setEmailError('')

    if (!email.trim()) {
      setEmailError('Email là bắt buộc')
      return
    }

    if (!validateEmail(email)) {
      setEmailError('Email không hợp lệ')
      return
    }

    const existingMember = members.find(
      (m) => m.email.toLowerCase() === email.toLowerCase()
    )
    if (existingMember) {
      setEmailError('Email này đã được mời')
      return
    }

    // Add new member
    const newMember: Member = {
      id: Date.now(),
      name: email.split('@')[0],
      email: email,
      role: role,
      joined_at: new Date().toISOString(),
      garden_access: ['garden_01']
    }
    setMembers((prev) => [...prev, newMember])
    setEmail('')
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleRevoke = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id))
    setRevokeConfirm(null)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Quản lý thành viên
        </h1>
        <p className="text-muted-foreground mt-1">
          Mời thành viên mới và quản lý quyền truy cập
        </p>
      </div>

      {/* Invite Form */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Mời thành viên mới
        </h3>

        {showSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm animate-fade-in">
            Đã gửi lời mời thành công!
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
              placeholder="email@example.com"
              className={cn(
                'w-full px-4 py-2.5 rounded-lg bg-input border text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary',
                emailError ? 'border-destructive' : 'border-border'
              )}
            />
            {emailError && (
              <p className="text-xs text-destructive">{emailError}</p>
            )}
          </div>

          <div className="w-full sm:w-40 space-y-2">
            <label className="text-sm font-medium text-foreground">Vai trò</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'OWNER' | 'MEMBER')}
              className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="MEMBER">Thành viên</option>
              <option value="OWNER">Chủ sở hữu</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleInvite}
              className={cn(
                'w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg',
                'bg-primary text-primary-foreground font-medium text-sm',
                'hover:bg-primary/90',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card',
                'transition-all duration-200'
              )}
            >
              <Send className="w-4 h-4" />
              <span>Gửi lời mời</span>
            </button>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Thành viên
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ngày tham gia
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      'inline-flex px-2 py-1 rounded text-xs font-medium',
                      getRoleBadgeColor(member.role)
                    )}>
                      {getRoleLabel(member.role)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {formatDate(member.joined_at)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {member.role !== 'OWNER' ? (
                      <div className="relative inline-block">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                          className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuId === member.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 top-10 w-40 py-1 rounded-lg bg-card border border-border shadow-lg z-20">
                              <button
                                onClick={() => {
                                  setRevokeConfirm(member.id)
                                  setOpenMenuId(null)
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Thu hồi quyền
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground px-2 py-1">
                        Không thể thu hồi
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog
        isOpen={revokeConfirm !== null}
        onClose={() => setRevokeConfirm(null)}
        onConfirm={() => revokeConfirm && handleRevoke(revokeConfirm)}
        title="Thu hồi quyền truy cập"
        description="Bạn có chắc chắn muốn thu hồi quyền truy cập của thành viên này? Họ sẽ không thể đăng nhập vào hệ thống."
      />
    </div>
  )
}
