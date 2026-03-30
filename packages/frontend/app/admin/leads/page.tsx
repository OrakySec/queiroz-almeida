'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState, useCallback } from 'react'
import { Search, Mail, MailOpen, Loader2, Phone, ChevronDown, ChevronUp } from 'lucide-react'
import api from '@/lib/api'
import { whatsAppLink } from '@/lib/utils'

interface Lead {
  id: string
  nome: string
  email: string
  telefone: string | null
  interesse: string | null
  mensagem: string | null
  lido: boolean
  createdAt: string
  empreendimento?: { nome: string } | null
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [lido, setLido] = useState<'' | 'true' | 'false'>('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [marking, setMarking] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (lido !== '') params.set('lido', lido)
      const res = await api.get(`/api/admin/leads?${params}`)
      setLeads(res.data.data ?? res.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [search, lido])

  useEffect(() => { load() }, [load])

  async function toggleLido(lead: Lead) {
    setMarking(lead.id)
    try {
      await api.patch(`/api/admin/leads/${lead.id}/lido`, { lido: !lead.lido })
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, lido: !l.lido } : l))
    } finally {
      setMarking(null)
    }
  }

  const naoLidos = leads.filter(l => !l.lido).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Leads</h1>
          <p className="text-sm text-brand-navy/50 mt-1">
            {leads.length} total · {' '}
            {naoLidos > 0 && (
              <span className="text-brand-marinho-glow font-semibold">{naoLidos} não lido(s)</span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-navy/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-brand-navy/10 bg-white text-brand-navy placeholder-brand-navy/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-marinho/30"
          />
        </div>
        <div className="flex gap-1.5">
          {[{ v: '' as const, l: 'Todos' }, { v: 'false' as const, l: 'Não lidos' }, { v: 'true' as const, l: 'Lidos' }].map(opt => (
            <button
              key={opt.v}
              onClick={() => setLido(opt.v)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                lido === opt.v
                  ? 'bg-brand-navy text-white'
                  : 'bg-white border border-brand-navy/10 text-brand-navy/60 hover:border-brand-navy/30'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-brand-navy/5 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-brand-marinho" />
          </div>
        ) : leads.length === 0 ? (
          <p className="text-sm text-brand-navy/40 text-center py-16">Nenhum lead encontrado.</p>
        ) : (
          <div className="divide-y divide-brand-navy/5">
            {leads.map(lead => (
              <div key={lead.id} className={`transition-colors ${!lead.lido ? 'bg-cyan-50/40' : 'hover:bg-brand-navy/[0.02]'}`}>
                <div className="px-5 py-4 flex items-start gap-4">
                  {/* Read indicator */}
                  <button
                    onClick={() => toggleLido(lead)}
                    disabled={marking === lead.id}
                    className="mt-0.5 shrink-0 text-brand-navy/30 hover:text-brand-marinho transition"
                    title={lead.lido ? 'Marcar como não lido' : 'Marcar como lido'}
                  >
                    {marking === lead.id
                      ? <Loader2 size={16} className="animate-spin" />
                      : lead.lido
                        ? <MailOpen size={16} />
                        : <Mail size={16} className="text-brand-marinho-glow" />
                    }
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className={`font-semibold text-brand-navy ${!lead.lido ? 'font-bold' : ''}`}>
                          {lead.nome}
                        </p>
                        <p className="text-xs text-brand-navy/40">{lead.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {lead.interesse && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-brand-marinho bg-cyan-50 border border-brand-marinho/20 px-2 py-0.5 rounded-full">
                            {lead.interesse}
                          </span>
                        )}
                        {lead.empreendimento && (
                          <span className="text-[10px] font-bold text-brand-navy/40 bg-brand-navy/5 px-2 py-0.5 rounded-full">
                            {lead.empreendimento.nome}
                          </span>
                        )}
                        <span className="text-[10px] text-brand-navy/30">
                          {new Date(lead.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center gap-3 mt-2">
                      {lead.telefone && (
                        <a
                          href={whatsAppLink(lead.telefone, `Olá ${lead.nome}, vi seu interesse em nossos empreendimentos!`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold hover:underline"
                        >
                          <Phone size={12} />
                          {lead.telefone}
                        </a>
                      )}
                      {lead.mensagem && (
                        <button
                          onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                          className="flex items-center gap-1 text-xs text-brand-navy/40 hover:text-brand-navy transition"
                        >
                          {expanded === lead.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {expanded === lead.id ? 'Ocultar mensagem' : 'Ver mensagem'}
                        </button>
                      )}
                    </div>

                    {/* Expanded message */}
                    {expanded === lead.id && lead.mensagem && (
                      <div className="mt-3 p-3 bg-brand-navy/5 rounded-xl text-sm text-brand-navy/70 leading-relaxed">
                        {lead.mensagem}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
