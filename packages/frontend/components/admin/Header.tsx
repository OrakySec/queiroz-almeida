'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Menu } from 'lucide-react'
import { useAdmin } from '@/context/AdminContext'
import api from '@/lib/api'

const breadcrumbs: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/empreendimentos': 'Empreendimentos',
  '/admin/empreendimentos/novo': 'Novo Empreendimento',
  '/admin/leads': 'Leads',
  '/admin/usuarios': 'Usuários',
}

interface Props {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: Props) {
  const pathname = usePathname()
  const { user } = useAdmin()
  const [pendentes, setPendentes] = useState(0)

  const title = breadcrumbs[pathname] ??
    (pathname.includes('/editar') ? 'Editar Empreendimento' : 'Admin')

  useEffect(() => {
    if (!user || user.role === 'EDITOR') return
    api.get('/api/admin/empreendimentos?status=AGUARDANDO_APROVACAO')
      .then(res => setPendentes(res.data.length))
      .catch(() => {})
  }, [user, pathname])

  return (
    <header className="h-16 bg-white border-b border-brand-borda flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-brand-texto/50 hover:text-brand-texto"
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 className="font-sans font-semibold text-brand-azul text-base">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Sino */}
        {user && user.role !== 'EDITOR' && (
          <button className="relative p-2 text-brand-texto/50 hover:text-brand-azul transition-colors">
            <Bell size={20} />
            {pendentes > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendentes}
              </span>
            )}
          </button>
        )}

        {/* Avatar */}
        {user && (
          <div className="w-8 h-8 bg-brand-azul rounded-full flex items-center justify-center">
            <span className="font-serif font-bold text-white text-xs">
              {user.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
