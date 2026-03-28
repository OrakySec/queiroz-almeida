'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { ArrowRight, Play, MapPin } from 'lucide-react'
import { useLeadModal } from '@/context/LeadModalContext'

const locations = [
  { city: 'Porto de Galinhas', state: 'PE' },
  { city: 'Maragogi', state: 'AL' },
]

export function Hero() {
  const { open: openLead } = useLeadModal()
  const containerRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  // Scrub video timeline based on scroll position
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (videoRef.current && Number.isFinite(videoRef.current.duration)) {
      videoRef.current.currentTime = latest * videoRef.current.duration
    }
  })

  const videoY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08])

  return (
    <section ref={containerRef} className="relative min-h-screen flex flex-col overflow-hidden bg-brand-dark">
      
      {/* Cinematic Background */}
      <motion.div className="absolute inset-0 z-0" style={{ y: videoY, scale }}>
        <video
          ref={videoRef}
          muted playsInline preload="auto"
          className="absolute inset-0 w-full h-full object-cover grayscale-[20%] contrast-[1.1]"
          poster="/hero-poster.jpg"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        
        {/* Layered Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/50 via-brand-dark/30 to-brand-dark" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/80 via-brand-dark/30 to-transparent" />
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
      </motion.div>

      {/* Main Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-12 w-full pt-36 pb-24"
      >
        <div className="max-w-4xl">
          
          {/* Location Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center gap-3 mb-10"
          >
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
              <MapPin size={12} className="text-brand-marinho-glow" />
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
                Porto de Galinhas, PE
              </span>
            </div>
            <div className="w-1 h-1 rounded-full bg-brand-marinho-glow/40" />
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
              <MapPin size={12} className="text-brand-marinho-glow" />
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
                Maragogi, AL
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <div className="relative mb-8 overflow-hidden">
            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
              className="font-serif font-bold text-white leading-[0.95] tracking-tight text-balance"
              style={{ fontSize: 'clamp(2.8rem, 8vw, 6.5rem)' }}
            >
              Invista no litoral com{' '}
              <em className="not-italic text-brand-marinho-glow">alto retorno.</em>
            </motion.h1>
          </div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="font-sans text-lg md:text-xl text-brand-silver/60 leading-relaxed mb-14 max-w-xl"
          >
            Flats de alto padrão em Porto de Galinhas e Maragogi.
            Onde a valorização imobiliária encontra o paraíso.
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
          >
            {/* Primary CTA — Pill */}
            <button
              onClick={() => openLead()}
              className="shimmer-button group relative bg-brand-marinho text-white font-sans font-bold text-xs uppercase tracking-[0.2em] px-10 py-4 rounded-full marinho-glow hover:scale-105 transition-transform"
            >
              <span className="relative z-10 flex items-center gap-3">
                Consultar Unidades
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            {/* Secondary — Ghost Pill */}
            <button className="flex items-center gap-4 group text-white/60 hover:text-white transition-colors">
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center transition-all group-hover:border-brand-marinho-glow group-hover:scale-110 group-hover:bg-brand-marinho-glow/10">
                <Play size={14} className="fill-white translate-x-0.5" />
              </div>
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest">Ver o Projeto</span>
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Founding Credibility Bar */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="relative z-10 border-t border-white/5 bg-white/[0.03] backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 md:gap-x-12 gap-y-4 text-center">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-marinho-glow animate-pulse" />
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-brand-silver/50">
                Fundada em 2016
              </span>
            </div>
            
            <div className="hidden md:block h-3 w-px bg-white/10" />
            
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-brand-silver/50">
              9+ anos no litoral nordestino
            </span>

            <div className="hidden md:block h-3 w-px bg-white/10" />

            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-brand-silver/50">
              3 empreendimentos ativos
            </span>

            <div className="hidden md:block h-3 w-px bg-white/10" />

            <div className="flex items-center gap-3">
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-brand-silver/50">
                100% foco no litoral
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-brand-marinho-glow/40" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-28 right-12 z-10 hidden xl:flex flex-col items-center gap-4"
      >
        <div className="h-20 w-px bg-gradient-to-b from-brand-marinho-glow to-transparent" />
        <span
          className="font-sans text-[8px] text-brand-marinho-glow font-bold uppercase tracking-[0.4em]"
          style={{ writingMode: 'vertical-rl' }}
        >
          Scroll
        </span>
      </motion.div>

      {/* Blueprint */}
      <div className="absolute inset-0 bg-blueprint opacity-[0.03] pointer-events-none z-[1]" />
    </section>
  )
}
