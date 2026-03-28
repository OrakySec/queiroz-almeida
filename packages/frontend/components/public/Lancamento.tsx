'use client'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Maximize2, BedDouble, Car, ArrowRight, TrendingUp } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useLeadModal } from '@/context/LeadModalContext'
import type { Empreendimento } from '@/types'

function ProgressBar({ progresso }: { progresso: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <div ref={ref} className="group">
      <div className="flex justify-between items-end mb-3">
        <span className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-brand-marinho">Evolução da Obra</span>
        <span className="font-serif text-xl font-bold text-brand-marinho">{progresso}%</span>
      </div>
      <div className="h-1.5 bg-brand-navy/5 overflow-hidden rounded-full relative">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-marinho to-brand-marinho-glow rounded-full relative z-10"
          initial={{ width: 0 }}
          animate={inView ? { width: `${progresso}%` } : { width: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </div>
    </div>
  )
}

export function Lancamento({ empreendimento: e }: { empreendimento: Empreendimento }) {
  const { open: openLead } = useLeadModal()
  const foto = e.fotos?.[0]

  return (
    <section className="bg-gradient-to-b from-white via-white to-slate-50/50 py-24 lg:py-40 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          
          {/* Visual Side (6/12) */}
          <div className="lg:col-span-6 relative group/visual">
            <motion.div
              initial={{ opacity: 0, scale: 1.05, rotate: 1 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(10,17,40,0.15)] bg-brand-navy/5 border border-brand-navy/5"
            >
              {foto ? (
                <Image
                  src={foto}
                  alt={e.nome}
                  fill
                  className="object-cover transition-transform duration-[2s] group-hover/visual:scale-110"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-navy to-brand-marinho flex items-center justify-center p-10">
                  <span className="font-serif text-white/10 text-3xl font-bold uppercase tracking-widest text-center">{e.nome}</span>
                </div>
              )}

              {/* Glass overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-brand-navy/10 to-transparent opacity-60 transition-opacity duration-700 group-hover/visual:opacity-80" />

              {/* Pill Badge — Lançamento */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="absolute top-8 left-8 bg-brand-marinho-glow text-brand-navy font-sans text-[10px] font-black uppercase tracking-[0.3em] px-6 py-3 rounded-full shadow-2xl"
              >
                ✦ Lançamento
              </motion.div>

              {/* Investment highlight at bottom */}
              {e.area_min && (
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1, type: "spring" }}
                  className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl px-8 py-6 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
                >
                  <div>
                    <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1.5">Metragem</p>
                    <p className="font-serif text-2xl font-bold text-white">
                      {e.area_min}{e.area_max && e.area_max !== e.area_min ? `–${e.area_max}` : ''} m²
                    </p>
                  </div>
                  <div className="h-10 w-px bg-white/20" />
                  <div>
                    <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1.5">Tipologia</p>
                    <p className="font-serif text-2xl font-bold text-white">{e.tipologia || 'Studio'}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <TrendingUp size={18} className="text-brand-marinho-glow" />
                    <span className="font-sans text-[8px] font-bold uppercase tracking-[0.2em] text-brand-marinho-glow">Alto Retorno</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Content Side (6/12) */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-10"
            >
              <div>
                <span className="font-sans text-[11px] font-black uppercase tracking-[0.4em] text-brand-marinho block mb-8 border-l-4 border-brand-marinho-glow pl-5 leading-none">
                  Asset de Luxo
                </span>

                <h2 className="font-serif font-bold text-brand-navy leading-[1.1] mb-6 tracking-tight"
                  style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
                  {e.nome}
                </h2>

                <div className="flex items-center gap-3 text-brand-navy/60">
                  <div className="w-2 h-2 rounded-full bg-brand-marinho-glow animate-pulse" />
                  <span className="font-sans text-xs font-bold uppercase tracking-[0.2em]">{e.cidade}{e.estado ? `, ${e.estado}` : ''}</span>
                </div>
              </div>

              {/* Specs — Rounded Pills with staggered spring */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Maximize2, label: 'Área', value: e.area_min ? `${e.area_min}${e.area_max && e.area_max !== e.area_min ? `–${e.area_max}` : ''} m²` : null },
                  { icon: BedDouble, label: 'Tipologia', value: e.tipologia },
                  { icon: Car, label: 'Unidades', value: e.total_unidades?.toString() },
                ].filter(s => s.value).map((spec, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", delay: 0.5 + (i * 0.1) }}
                    className="flex items-center gap-3 bg-brand-navy/[0.04] border border-brand-navy/5 rounded-full px-6 py-4 hover:bg-brand-marinho group cursor-default transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                  >
                    <spec.icon size={16} className="text-brand-marinho group-hover:text-brand-marinho-glow transition-colors" />
                    <span className="font-sans text-xs font-black text-brand-navy group-hover:text-white transition-colors uppercase tracking-widest">
                      {spec.value}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Progress */}
              <div className="bg-brand-navy/[0.02] border border-brand-navy/5 rounded-[2.5rem] p-8 hover:bg-white hover:shadow-2xl transition-all duration-700">
                <ProgressBar progresso={e.progresso} />
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => openLead(e.nome)}
                  className="shimmer-button flex-[1.5] bg-brand-navy text-white font-sans font-black text-[11px] uppercase tracking-[0.3em] py-5 rounded-full hover:bg-brand-marinho transition-all shadow-2xl hover:scale-105 active:scale-95"
                >
                  Receber Dossier Completo
                </button>
                <Link
                  href="/evolucao-da-obra"
                  className="flex-1 flex items-center justify-center gap-4 border-2 border-brand-navy/10 text-brand-navy font-sans text-[11px] font-black uppercase tracking-[0.3em] py-5 rounded-full hover:bg-brand-navy hover:text-white transition-all group overflow-hidden relative"
                >
                  <span className="relative z-10">Ver Evolução</span>
                  <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform relative z-10" />
                  <div className="absolute inset-0 bg-brand-navy translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
