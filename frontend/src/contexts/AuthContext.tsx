import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { User } from '@/types'

const AUTH_KEY = 'sgmc_user'
const TOKEN_KEY = 'sgmc_token'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const MOCK_USERS: Record<string, User & { password: string }> = {
  'owner@sgmc.com': {
    id: 1, email: 'owner@sgmc.com', password: 'Password123',
    name: 'Nguyễn Thành Đạt', role: 'OWNER', garden_access: ['garden_01', 'garden_02']
  },
  'member@sgmc.com': {
    id: 2, email: 'member@sgmc.com', password: 'Password123',
    name: 'Trần Thị Lan', role: 'MEMBER', garden_access: ['garden_01']
  },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    const savedUser = localStorage.getItem(AUTH_KEY)
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 600))
    const found = MOCK_USERS[email.toLowerCase()]
    if (!found || found.password !== password) {
      throw new Error('Email hoặc mật khẩu không đúng')
    }
    const { password: _, ...userData } = found
    const mockToken = `mock-jwt-${Date.now()}`
    localStorage.setItem(TOKEN_KEY, mockToken)
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData))
    setToken(mockToken)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(AUTH_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...data }
      localStorage.setItem(AUTH_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
