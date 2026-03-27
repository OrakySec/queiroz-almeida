'use client'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Empreendimento } from '@/types'

const statusLabel: Record<string, string> = {
  PUBLICADO: 'Em obra',
}

interface Props {
  empreendimento: Empreendimento
}

export function EmpreendimentoCard({ empreendimento: e }: Props) {
  const foto = e.fotos?.[0]
  const label = e.is_lancamento ? 'Lançamento' : (statusLabel[e.status] || 'Em obra')

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex-shrink-0 w-full md:w-[380px] bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_30px_70px_-10px_rgba(10,17,40,0.2)] transition-all duration-700"
    >
      {/* Image Container with Luxury Hover */}
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-navy/5">
        {foto ? (
          <Image
            src={foto} alt={e.nome} fill
            className="object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-[0.22,1,0.36,1]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy to-brand-marinho flex items-center justify-center p-8">
            <span className="font-serif text-white/10 text-xl font-bold uppercase tracking-widest text-center">{e.nome}</span>
          </div>
        )}

        {/* Maritime Glow Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-brand-marinho/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Elegant Pill Badge */}
        <div className={`absolute top-5 left-5 font-sans text-[9px] font-black uppercase tracking-[0.25em] px-5 py-2.5 rounded-full shadow-xl transition-all duration-500 group-hover:scale-110 ${
          e.is_lancamento
            ? 'bg-brand-marinho-glow text-brand-navy'
            : 'bg-white/95 backdrop-blur-sm text-brand-navy'
        }`}>
          {label}
        </div>

        {/* Refined Progress Bar */}
        {e.progresso > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10 z-10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${e.progresso}%` }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              className="h-full bg-gradient-to-r from-brand-marinho to-brand-marinho-glow rounded-r-full"
            />
          </div>
        )}
      </div>

      {/* Content Side */}
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="font-serif font-bold text-2xl text-brand-navy mb-3 group-hover:text-brand-marinho transition-colors leading-[1.1] tracking-tight">
              {e.nome}
            </h3>
            <div className="flex items-center gap-2 text-brand-navy/40">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-marinho-glow" />
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] truncate">{e.localizacao}</span>
            </div>
          </div>
          <Link
            href={`/empreendimentos/${e.slug}`}
            className="w-12 h-12 border border-brand-navy/5 flex items-center justify-center rounded-full hover:bg-brand-marinho hover:text-white hover:border-brand-marinho transition-all duration-500 shrink-0 group/arrow shadow-sm"
          >
            <ArrowUpRight size={18} className="group-hover/arrow:rotate-45 group-hover/arrow:scale-110 transition-transform duration-500" />
          </Link>
        </div>

        {/* Specs — Luxury Pill Tags */}
        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-brand-navy/5">
          {e.area_min && (
            <div className="flex items-center gap-2 font-sans text-[10px] font-bold text-brand-navy/60 bg-brand-navy/[0.03] px-4 py-2 rounded-full border border-brand-navy/5 group-hover:bg-brand-navy group-hover:text-white transition-colors duration-500">
              <span>{e.area_min}{e.area_max && e.area_max !== e.area_min ? `–${e.area_max}` : ''} m²</span>
            </div>
          )}
          {e.quartos && (
            <div className="flex items-center gap-2 font-sans text-[10px] font-bold text-brand-navy/60 bg-brand-navy/[0.03] px-4 py-2 rounded-full border border-brand-navy/5 group-hover:bg-brand-navy group-hover:text-white transition-colors duration-500">
              <span>{e.quartos} {parseInt(e.quartos) === 1 ? 'quarto' : 'quartos'}</span>
            </div>
          )}
          <Link
            href={`/empreendimentos/${e.slug}`}
            className="ml-auto font-sans text-[10px] font-black text-brand-marinho-glow uppercase tracking-[0.2em] hover:text-brand-navy transition-colors flex items-center gap-2"
          >
           Explorar <div className="w-1 h-1 rounded-full bg-brand-marinho-glow" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
