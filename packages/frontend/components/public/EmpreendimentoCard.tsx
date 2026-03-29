'use client'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, ArrowUpRight, Maximize2, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Empreendimento } from '@/types'

interface Props {
  empreendimento: Empreendimento
}

export function EmpreendimentoCard({ empreendimento: e }: Props) {
  const foto = e.fotos?.[0]
  const label = e.is_lancamento ? 'Lançamento' : 'Em Obra'

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex-shrink-0 w-full bg-brand-dark border border-white/[0.07] rounded-[2rem] overflow-hidden hover:border-brand-marinho-glow/30 transition-all duration-700"
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
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/30 to-transparent" />

          {/* Badge */}
          <div className={`absolute top-5 left-5 font-sans text-[8px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full backdrop-blur-md border shadow-lg ${
            e.is_lancamento
              ? 'bg-brand-marinho-glow/15 border-brand-marinho-glow/40 text-brand-marinho-glow'
              : 'bg-white/10 border-white/20 text-white'
          }`}>
            {label}
          </div>

          {/* Arrow button top-right */}
          <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110 group-hover:border-brand-marinho-glow/60">
            <ArrowUpRight size={16} className="text-white" />
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
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={10} className="text-brand-marinho-glow shrink-0" />
            <span className="font-sans text-[9px] font-bold uppercase tracking-[0.25em] text-white/70">
              {e.cidade}{e.estado ? `, ${e.estado}` : ''}
            </span>
          </div>

          {/* Name */}
          <h3 className="font-serif font-bold text-white leading-tight tracking-tight mb-5 group-hover:text-brand-marinho-glow transition-colors duration-500"
            style={{ fontSize: 'clamp(1.3rem, 3vw, 1.6rem)' }}>
            {e.nome}
          </h3>

          {/* Divider */}
          <div className="h-px w-full bg-white/[0.06] mb-5" />

          {/* Specs row */}
          <div className="flex flex-wrap items-center gap-4">
            {e.area_min && (
              <div className="flex items-center gap-2">
                <Maximize2 size={11} className="text-white/60" />
                <span className="font-sans text-[10px] font-bold text-white/80 uppercase tracking-widest">
                  {e.area_min}{e.area_max && e.area_max !== e.area_min ? `–${e.area_max}` : ''} m²
                </span>
              </div>
            )}
            {e.tipologia && (
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-white/40" />
                <span className="font-sans text-[10px] font-bold text-white/80 uppercase tracking-widest">
                  {e.tipologia}
                </span>
              </div>
            )}
            {e.progresso > 0 && (
              <div className="ml-auto flex items-center gap-2">
                <TrendingUp size={11} className="text-brand-marinho-glow" />
                <span className="font-sans text-[10px] font-bold text-brand-marinho-glow uppercase tracking-widest">
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
