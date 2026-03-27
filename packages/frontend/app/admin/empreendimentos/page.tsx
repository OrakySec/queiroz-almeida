'use client'
import { Suspense } from 'react'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Plus, Search, Pencil, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { useAdmin } from '@/context/AdminContext'

interface Emp {
  id: string
  nome: string
  slug: string
  cidade: string
  estado: string
  status: string
  destaque: boolean
  updatedAt: string
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'RASCUNHO', label: 'Rascunho' },
  { value: 'AGUARDANDO_APROVACAO', label: 'Aguardando' },
  { value: 'PUBLICADO', label: 'Publicado' },
  { value: 'REJEITADO', label: 'Rejeitado' },
]

function EmpreendimentosContent() {
  const { user } = useAdmin()
  const searchParams = useSearchParams()
  const [items, setItems] = useState<Emp[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? '')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const canApprove = user?.role === 'ADMIN' || user?.role === 'GERENTE'
  const canDelete  = user?.role === 'ADMIN'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (search) params.set('search', search)
      const res = await api.get(`/api/admin/empreendimentos?${params}`)
      setItems(res.data.data ?? res.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  useEffect(() => { load() }, [load])

  async function handleStatus(id: string, status: string) {
    setActionLoading(id + status)
    try {
      await api.patch(`/api/admin/empreendimentos/${id}/status`, { status })
      await load()
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erro')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) return
    setActionLoading(id + 'del')
    try {
      await api.delete(`/api/admin/empreendimentos/${id}`)
      await load()
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erro')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Empreendimentos</h1>
          <p className="text-sm text-brand-navy/50 mt-1">{items.length} registro(s)</p>
        </div>
        <Link href="/admin/empreendimentos/novo"
          className="flex items-center gap-2 bg-brand-marinho text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-brand-marinho/90 transition w-fit"
        >
          <Plus size={16} />
          Novo Empreendimento
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-navy/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou cidade..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-brand-navy/10 bg-white text-brand-navy placeholder-brand-navy/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-marinho/30"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                statusFilter === opt.value
                  ? 'bg-brand-navy text-white'
                  : 'bg-white border border-brand-navy/10 text-brand-navy/60 hover:border-brand-navy/30'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-brand-navy/5 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-brand-marinho" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-brand-navy/40 text-center py-16">Nenhum empreendimento encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-navy/5">
                  {['Nome', 'Localização', 'Status', 'Atualizado', 'Ações'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-brand-navy/30">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-navy/5">
                {items.map(emp => (
                  <tr key={emp.id} className="hover:bg-brand-navy/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-brand-navy">{emp.nome}</p>
                      {emp.destaque && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                          Destaque
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-brand-navy/60">{emp.cidade}, {emp.estado}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={emp.status as any} />
                    </td>
                    <td className="px-5 py-4 text-brand-navy/40 text-xs">
                      {new Date(emp.updatedAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/empreendimentos/${emp.id}/editar`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-navy/5 text-brand-navy/40 hover:text-brand-navy transition"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </Link>

                        {canApprove && emp.status === 'AGUARDANDO_APROVACAO' && (
                          <>
                            <button
                              onClick={() => handleStatus(emp.id, 'PUBLICADO')}
                              disabled={!!actionLoading}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-50 text-emerald-500 transition"
                              title="Aprovar"
                            >
                              {actionLoading === emp.id + 'PUBLICADO'
                                ? <Loader2 size={14} className="animate-spin" />
                                : <CheckCircle size={14} />
                              }
                            </button>
                            <button
                              onClick={() => handleStatus(emp.id, 'REJEITADO')}
                              disabled={!!actionLoading}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition"
                              title="Rejeitar"
                            >
                              {actionLoading === emp.id + 'REJEITADO'
                                ? <Loader2 size={14} className="animate-spin" />
                                : <XCircle size={14} />
                              }
                            </button>
                          </>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => handleDelete(emp.id, emp.nome)}
                            disabled={!!actionLoading}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition"
                            title="Excluir"
                          >
                            {actionLoading === emp.id + 'del'
                              ? <Loader2 size={14} className="animate-spin" />
                              : <Trash2 size={14} />
                            }
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EmpreendimentosAdminPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-brand-marinho" />
      </div>
    }>
      <EmpreendimentosContent />
    </Suspense>
  )
}
