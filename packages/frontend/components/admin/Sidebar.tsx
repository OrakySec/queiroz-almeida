'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Building2, Users, FileText, LogOut, X,
} from 'lucide-react'
import { useAdmin } from '@/context/AdminContext'
import { removeToken } from '@/lib/auth'
import api from '@/lib/api'

const allLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'GERENTE', 'EDITOR'] },
  { href: '/admin/empreendimentos', label: 'Empreendimentos', icon: Building2, roles: ['ADMIN', 'GERENTE', 'EDITOR'] },
  { href: '/admin/leads', label: 'Leads', icon: FileText, roles: ['ADMIN', 'GERENTE'] },
  { href: '/admin/usuarios', label: 'Usuários', icon: Users, roles: ['ADMIN', 'GERENTE'] },
]

interface Props {
  onClose?: () => void
}

export function Sidebar({ onClose }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAdmin()

  const links = allLinks.filter(l => user && l.roles.includes(user.role))

  const handleLogout = async () => {
    try { await api.post('/api/auth/logout') } catch {}
    removeToken()
    router.push('/login')
  }

  return (
    <aside className="flex flex-col h-full bg-white border-r border-brand-borda w-64">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-brand-borda shrink-0">
        <div className="font-serif text-lg font-bold">
          Queiroz<span className="text-brand-dourado">Almeida</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-brand-texto/40 hover:text-brand-texto lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      {/* User */}
      {user && (
        <div className="px-6 py-4 border-b border-brand-borda shrink-0">
          <div className="w-9 h-9 bg-brand-azul rounded-full flex items-center justify-center mb-2">
            <span className="font-serif font-bold text-white text-sm">
              {user.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <p className="font-sans text-sm font-semibold text-brand-azul leading-tight">{user.nome}</p>
          <p className="font-sans text-xs text-brand-texto/50 mt-0.5">{user.role}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 font-sans text-sm transition-all ${
                active
                  ? 'bg-brand-azul text-white font-medium'
                  : 'text-brand-texto hover:bg-brand-gelo'
              }`}
            >
              <Icon size={18} className={active ? 'text-brand-dourado' : 'text-brand-texto/50'} />
              {label}
              {active && <span className="ml-auto w-1 h-4 bg-brand-dourado rounded-full" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-brand-borda pt-4 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-sm text-brand-texto/60 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors font-sans"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  )
}
