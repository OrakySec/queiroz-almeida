'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import api from '@/lib/api'

export interface AdminUser {
  id: string
  nome: string
  email: string
  role: 'ADMIN' | 'GERENTE' | 'EDITOR'
  ativo: boolean
}

interface AdminContextType {
  user: AdminUser | null
  loading: boolean
}

const AdminContext = createContext<AdminContextType | null>(null)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/auth/me')
      .then(res => setUser(res.data))
      .catch(() => { window.location.href = '/login' })
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminContext.Provider value={{ user, loading }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be inside AdminProvider')
  return ctx
}
