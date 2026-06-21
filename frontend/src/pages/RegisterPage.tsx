import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Leaf, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Họ và tên là bắt buộc')
      .min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
    email: z
      .string()
      .min(1, 'Email là bắt buộc')
      .email('Email không hợp lệ'),
    password: z
      .string()
      .min(1, 'Mật khẩu là bắt buộc')
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(/[A-Z]/, 'Phải có ít nhất 1 chữ hoa')
      .regex(/[a-z]/, 'Phải có ít nhất 1 chữ thường')
      .regex(/[0-9]/, 'Phải có ít nhất 1 số'),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password', '')

  const passwordRequirements = [
    { label: 'Ít nhất 8 ký tự', met: password.length >= 8 },
    { label: 'Ít nhất 1 chữ hoa', met: /[A-Z]/.test(password) },
    { label: 'Ít nhất 1 chữ thường', met: /[a-z]/.test(password) },
    { label: 'Ít nhất 1 số', met: /[0-9]/.test(password) },
  ]

  const onSubmit = async (data: RegisterFormData) => {
    setError(null)
    setIsLoading(true)
    try {
      // Simulate registration delay
      await new Promise((r) => setTimeout(r, 800))

      // For demo: store user in localStorage (simplified registration)
      const users = JSON.parse(localStorage.getItem('sgmc_registered_users') || '[]')

      // Check if email already exists
      if (users.some((u: { email: string }) => u.email === data.email)) {
        throw new Error('Email đã được sử dụng')
      }

      // Add new user
      const newUser = {
        name: data.name,
        email: data.email,
        password: data.password,
      }
      users.push(newUser)
      localStorage.setItem('sgmc_registered_users', JSON.stringify(users))

      setIsSuccess(true)

      // Redirect to login after success
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-950/80 via-background to-background pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent pointer-events-none" />

      {/* Register Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-2xl border border-border/50 p-8">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-card-foreground tracking-tight">
              Đăng ký
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Tạo tài khoản Smart Garden Control
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="mb-6 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm animate-fade-in flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Đăng ký thành công! Đang chuyển hướng...</span>
            </div>
          )}

          {/* Register Form */}
          {!isSuccess && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name Field */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-card-foreground"
                >
                  Họ và tên
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  disabled={isLoading}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg bg-input border border-border text-card-foreground placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-all duration-200'
                  )}
                  placeholder="Nguyễn Văn A"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-destructive text-sm animate-fade-in">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-card-foreground"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  disabled={isLoading}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg bg-input border border-border text-card-foreground placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-all duration-200'
                  )}
                  placeholder="email@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-destructive text-sm animate-fade-in">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-card-foreground"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    disabled={isLoading}
                    className={cn(
                      'w-full px-4 py-3 pr-12 rounded-lg bg-input border border-border text-card-foreground placeholder:text-muted-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'transition-all duration-200'
                    )}
                    placeholder="••••••••"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors disabled:opacity-50"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm animate-fade-in">
                    {errors.password.message}
                  </p>
                )}

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2 space-y-1">
                    {passwordRequirements.map((req, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'flex items-center gap-2 text-xs transition-colors',
                          req.met ? 'text-primary' : 'text-muted-foreground'
                        )}
                      >
                        {req.met ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-card-foreground"
                >
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    disabled={isLoading}
                    className={cn(
                      'w-full px-4 py-3 pr-12 rounded-lg bg-input border border-border text-card-foreground placeholder:text-muted-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'transition-all duration-200'
                    )}
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors disabled:opacity-50"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-destructive text-sm animate-fade-in">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'w-full py-3 px-4 rounded-lg font-semibold text-primary-foreground',
                  'bg-primary hover:bg-primary/90',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-all duration-200',
                  'flex items-center justify-center gap-2'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang đăng ký...</span>
                  </>
                ) : (
                  <span>Đăng ký</span>
                )}
              </button>
            </form>
          )}

          {/* Login Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Đã có tài khoản?{' '}
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault()
                navigate('/login')
              }}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Đăng nhập ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
