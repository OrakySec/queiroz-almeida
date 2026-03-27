'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { Building2, Users, MessageSquare, TrendingUp, Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react'
import api from '@/lib/api'
import { StatusBadge } from '@/components/admin/StatusBadge'
import Link from 'next/link'

interface Stats {
  empreendimentos: { total: number; publicados: number; aguardando: number }
  leads: { total: number; hoje: number; naoLidos: number }
}

interface RecentLead {
  id: string
  nome: string
  email: string
  interesse: string | null
  createdAt: string
  lido: boolean
}

interface RecentEmpreendimento {
  id: string
  nome: string
  slug: string
  status: string
  cidade: string
  updatedAt: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([])
  const [recentEmp, setRecentEmp] = useState<RecentEmpreendimento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [leadsRes, empRes] = await Promise.all([
          api.get('/api/leads?limit=5&sort=createdAt:desc'),
          api.get('/api/admin/empreendimentos?limit=5&sort=updatedAt:desc'),
        ])

        const leads = leadsRes.data.data ?? leadsRes.data
        const emps  = empRes.data.data  ?? empRes.data

        setRecentLeads(leads.slice(0, 5))
        setRecentEmp(emps.slice(0, 5))

        // Derive stats from returned data
        const allLeadsRes = await api.get('/api/leads')
        const allLeads = allLeadsRes.data.data ?? allLeadsRes.data
        const allEmpRes = await api.get('/api/admin/empreendimentos?limit=100')
        const allEmps = allEmpRes.data.data ?? allEmpRes.data

        const today = new Date().toDateString()
        setStats({
          empreendimentos: {
            total: allEmps.length,
            publicados: allEmps.filter((e: RecentEmpreendimento) => e.status === 'PUBLICADO').length,
            aguardando: allEmps.filter((e: RecentEmpreendimento) => e.status === 'AGUARDANDO_APROVACAO').length,
          },
          leads: {
            total: allLeads.length,
            hoje: allLeads.filter((l: RecentLead) => new Date(l.createdAt).toDateString() === today).length,
            naoLidos: allLeads.filter((l: RecentLead) => !l.lido).length,
          },
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-marinho border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const cards = [
    {
      label: 'Publicados',
      value: stats?.empreendimentos.publicados ?? 0,
      icon: Building2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      href: '/admin/empreendimentos?status=PUBLICADO',
    },
    {
      label: 'Aguardando Aprovação',
      value: stats?.empreendimentos.aguardando ?? 0,
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      href: '/admin/empreendimentos?status=AGUARDANDO_APROVACAO',
    },
    {
      label: 'Leads Hoje',
      value: stats?.leads.hoje ?? 0,
      icon: TrendingUp,
      color: 'text-brand-marinho',
      bg: 'bg-cyan-50',
      href: '/admin/leads',
    },
    {
      label: 'Leads Não Lidos',
      value: stats?.leads.naoLidos ?? 0,
      icon: MessageSquare,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      href: '/admin/leads?lido=false',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Dashboard</h1>
        <p className="text-sm text-brand-navy/50 mt-1">Visão geral do sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}
            className="bg-white rounded-2xl p-6 border border-brand-navy/5 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                <card.icon size={20} className={card.color} />
              </div>
              <Eye size={14} className="text-brand-navy/20 group-hover:text-brand-marinho transition-colors mt-1" />
            </div>
            <p className="text-3xl font-bold text-brand-navy">{card.value}</p>
            <p className="text-xs text-brand-navy/50 mt-1 font-medium">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-2xl border border-brand-navy/5 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-navy/5">
            <h2 className="font-semibold text-brand-navy flex items-center gap-2">
              <MessageSquare size={16} className="text-brand-marinho" />
              Leads Recentes
            </h2>
            <Link href="/admin/leads" className="text-xs text-brand-marinho hover:underline font-medium">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-brand-navy/5">
            {recentLeads.length === 0 && (
              <p className="text-sm text-brand-navy/40 text-center py-8">Nenhum lead ainda.</p>
            )}
            {recentLeads.map((lead) => (
              <div key={lead.id} className="px-6 py-4 hover:bg-brand-navy/[0.02] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-navy flex items-center gap-2">
                      {lead.nome}
                      {!lead.lido && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-marinho-glow inline-block" />
                      )}
                    </p>
                    <p className="text-xs text-brand-navy/40">{lead.email}</p>
                  </div>
                  <div className="text-right">
                    {lead.interesse && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-marinho bg-cyan-50 px-2 py-1 rounded-full">
                        {lead.interesse}
                      </span>
                    )}
                    <p className="text-[10px] text-brand-navy/30 mt-1">
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Empreendimentos */}
        <div className="bg-white rounded-2xl border border-brand-navy/5 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-navy/5">
            <h2 className="font-semibold text-brand-navy flex items-center gap-2">
              <Building2 size={16} className="text-brand-marinho" />
              Empreendimentos
            </h2>
            <Link href="/admin/empreendimentos" className="text-xs text-brand-marinho hover:underline font-medium">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-brand-navy/5">
            {recentEmp.length === 0 && (
              <p className="text-sm text-brand-navy/40 text-center py-8">Nenhum empreendimento.</p>
            )}
            {recentEmp.map((emp) => (
              <div key={emp.id} className="px-6 py-4 hover:bg-brand-navy/[0.02] transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-navy truncate">{emp.nome}</p>
                    <p className="text-xs text-brand-navy/40">{emp.cidade}</p>
                  </div>
                  <StatusBadge status={emp.status as any} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
