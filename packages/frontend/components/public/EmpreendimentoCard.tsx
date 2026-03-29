'use client'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, ArrowUpRight, Maximize2, BedDouble, Car, Bath, ShowerHead } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Empreendimento } from '@/types'

interface Props {
  empreendimento: Empreendimento
}

function formatPreco(valor?: number | string | null) {
  const n = Number(valor)
  if (!n) return null
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n)
}

function faixa(min?: number, max?: number, suffix = '') {
  if (min == null && max == null) return null
  if (min != null && max != null && min !== max) return `${min}–${max}${suffix}`
  return `${min ?? max}${suffix}`
}

export function EmpreendimentoCard({ empreendimento: e }: Props) {
  const foto = e.fotos?.[0]

  // Status: Concluído > Lançamento > Em Obra
  const label = e.progresso >= 100 ? 'Concluído' : e.is_lancamento ? 'Lançamento' : 'Em Obra'
  const labelStyle = e.progresso >= 100
    ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-400'
    : e.is_lancamento
      ? 'bg-brand-marinho-glow/15 border-brand-marinho-glow/40 text-brand-marinho-glow'
      : 'bg-white/10 border-white/20 text-white'

  const localizacao = [e.cidade, e.estado].filter(Boolean).join(' · ')
  const area      = faixa(e.area_min, e.area_max, ' m²')
  const quartos   = faixa(e.quartos_min, e.quartos_max)
  const suites    = faixa(e.suites_min, e.suites_max)
  const banheiros = faixa(e.banheiros_min, e.banheiros_max)
  const vagas     = e.vagas_tipo === 'ROTATIVA' ? 'Rotativa' : faixa(e.vagas_min, e.vagas_max)
  const precoMin  = formatPreco(e.preco_min)
  const precoMax  = formatPreco(e.preco_max)
  const preco     = precoMin
    ? precoMax && precoMax !== precoMin ? `${precoMin} – ${precoMax}` : precoMin
    : null

  const specs = [
    { icon: Maximize2,  label: 'Área',      value: area },
    { icon: BedDouble,  label: 'Quartos',   value: quartos },
    { icon: Bath,       label: 'Suítes',    value: suites },
    { icon: ShowerHead, label: 'Banheiros', value: banheiros },
    { icon: Car,        label: 'Vagas',     value: vagas },
  ].filter(s => s.value)

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex-shrink-0 w-full bg-brand-navy border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-brand-marinho-glow/30 shadow-xl shadow-brand-navy/5 transition-all duration-700"
    >
      <Link href={`/empreendimentos/${e.slug}`} className="block">

        {/* ── Image ── */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {foto ? (
            <Image
              src={foto} alt={e.nome} fill
              className="object-cover group-hover:scale-105 transition-transform duration-[1.4s] ease-[0.22,1,0.36,1] brightness-90 group-hover:brightness-100"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-navy to-brand-marinho" />
          )}

          {/* Gradient veil */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-transparent" />

          {/* Badges — top left */}
          <div className="absolute top-5 left-5 flex items-center gap-2">
            <span className={`font-sans text-[8px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full backdrop-blur-md border shadow-lg ${labelStyle}`}>
              {label}
            </span>
            {e.tipo_imovel && (
              <span className="font-sans text-[8px] font-black uppercase tracking-[0.25em] px-3 py-2 rounded-full backdrop-blur-md border border-white/10 bg-brand-navy/60 text-white/70">
                {e.tipo_imovel}
              </span>
            )}
          </div>

          {/* Padrão badge — top right */}
          <div className="absolute top-5 right-5 flex items-center gap-2">
            {e.padrao && (
              <span className="font-sans text-[7px] font-black uppercase tracking-[0.25em] px-3 py-1.5 rounded-full backdrop-blur-md border border-brand-marinho-glow/30 bg-brand-marinho-glow/10 text-brand-marinho-glow">
                {e.padrao}
              </span>
            )}
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110">
              <ArrowUpRight size={16} className="text-white" />
            </div>
          </div>

          {/* Progress bar */}
          {e.progresso > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${e.progresso}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                className="h-full bg-gradient-to-r from-brand-marinho to-brand-marinho-glow"
              />
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="p-7 pt-6">

          {/* Location */}
          <div className="flex items-center gap-2.5 mb-2">
            <MapPin size={11} className="text-brand-marinho-glow shrink-0" />
            <span className="font-sans text-[9px] font-black uppercase tracking-[0.25em] text-white/40">
              {localizacao}
            </span>
          </div>

          {/* Name */}
          <h3
            className="font-serif font-bold text-white leading-tight tracking-tight mb-4 group-hover:text-brand-marinho-glow transition-colors duration-500"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 1.85rem)' }}
          >
            {e.nome}
          </h3>

          {/* Descrição breve */}
          {e.descricao_breve && (
            <p className="font-sans text-[13px] text-white/40 leading-relaxed mb-6 line-clamp-2 font-light">
              {e.descricao_breve}
            </p>
          )}

          {/* Divider */}
          <div className="h-px w-full bg-white/5 mb-6" />

          {/* Specs grid — 2 colunas */}
          {specs.length > 0 && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-8">
              {specs.map(({ icon: Icon, label: specLabel, value }) => (
                <div key={specLabel} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                    <Icon size={12} className="text-brand-marinho-glow" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-sans text-[9px] font-bold uppercase tracking-widest text-white/20 leading-none mb-1">
                      {specLabel}
                    </p>
                    <p className="font-sans text-sm font-bold text-white/80 leading-none truncate">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Price + progress row */}
          <div className="flex items-end justify-between border-t border-white/5 pt-6 mt-auto">
            {preco && (
              <div>
                <p className="font-sans text-[9px] font-black uppercase tracking-widest text-white/20 mb-1.5">
                  A partir de
                </p>
                <p className="font-serif font-bold text-white text-xl leading-none">
                  {precoMin}
                </p>
              </div>
            )}
 
            {e.progresso > 0 && (
              <div className="text-right">
                <p className="font-sans text-[7px] font-black uppercase tracking-widest text-white/20 mb-1">
                  Andamento da Obra
                </p>
                <span className="font-sans text-[10px] font-black uppercase tracking-widest text-brand-marinho-glow leading-none block">
                  {e.progresso}%
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
