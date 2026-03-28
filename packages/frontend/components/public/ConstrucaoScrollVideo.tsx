'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { ArrowRight, Building2, Hammer, CheckCircle2 } from 'lucide-react'
import { useLeadModal } from '@/context/LeadModalContext'

const etapas = [
  { icon: Hammer, label: 'Estrutura' },
  { icon: Building2, label: 'Construção' },
  { icon: CheckCircle2, label: 'Entrega' },
]

export function ConstrucaoScrollVideo() {
  const { open: openLead } = useLeadModal()
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  // Scrub video — rolar pra baixo avança, rolar pra cima reverte
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const video = videoRef.current
    if (!video || !Number.isFinite(video.duration)) return
    // Map scroll 0.1–0.9 to full video duration for a smooth in/out margin
    const mapped = Math.max(0, Math.min(1, (latest - 0.1) / 0.8))
    const target = mapped * video.duration
    video.currentTime = Math.min(target, video.duration - 0.05)
  })

  // Parallax/fade on the text column
  const textX = useTransform(scrollYProgress, [0.1, 0.5], [-30, 0])
  const textOpacity = useTransform(scrollYProgress, [0.05, 0.25], [0, 1])

  // Progress bar fills as scroll advances
  const barScale = useTransform(scrollYProgress, [0.1, 0.88], [0, 1])

  return (
    // 400vh outer container — user must scroll through it entirely
    <div ref={containerRef} className="relative h-[400vh] bg-brand-dark">

      {/* Sticky inner frame — stays fixed while user scrolls */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">

        {/* Ambient blueprint glow */}
        <div className="absolute inset-0 bg-blueprint opacity-[0.025] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-marinho-glow/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center gap-12 md:gap-16">

          {/* ── Left Column: Text ─────────────────────────────────── */}
          <motion.div
            style={{ x: textX, opacity: textOpacity }}
            className="w-full md:w-[45%] shrink-0 flex flex-col items-start"
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <span className="font-sans text-[9px] font-black uppercase tracking-[0.3em] text-brand-marinho-glow border-l-2 border-brand-marinho-glow pl-3">
                Em Construção
              </span>
            </div>

            {/* Headline */}
            <h2
              className="font-serif font-bold text-white leading-[1.05] tracking-tight mb-6"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              Cada detalhe{' '}
              <em className="not-italic text-brand-marinho-glow">
                construído para durar.
              </em>
            </h2>

            {/* Body */}
            <p className="font-sans text-base text-white/50 leading-relaxed mb-10 max-w-md">
              Acompanhe a evolução do empreendimento em tempo real. Da fundação à
              entrega das chaves, cada etapa é executada com rigor técnico e acabamento
              de alto padrão — garantindo segurança e valorização permanente do seu patrimônio.
            </p>

            {/* Construction Steps */}
            <div className="flex flex-col gap-4 mb-10 w-full">
              {etapas.map(({ icon: Icon, label }, i) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full border border-brand-marinho-glow/30 bg-brand-marinho-glow/10 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-brand-marinho-glow" />
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-white/50">
                      {label}
                    </span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar — synced with scroll */}
            <div className="w-full mb-8">
              <div className="flex justify-between mb-2">
                <span className="font-sans text-[9px] font-black uppercase tracking-widest text-white/30">
                  Progresso da Obra
                </span>
                <span className="font-sans text-[9px] font-black uppercase tracking-widest text-brand-marinho-glow">
                  Ao Vivo
                </span>
              </div>
              <div className="h-px w-full bg-white/10 relative overflow-hidden rounded-full">
                <motion.div
                  style={{ scaleX: barScale }}
                  className="absolute inset-0 bg-gradient-to-r from-brand-marinho to-brand-marinho-glow origin-left"
                />
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => openLead()}
              className="group flex items-center gap-3 font-sans text-xs font-bold uppercase tracking-[0.2em] text-white border border-white/15 rounded-full px-6 py-3 hover:border-brand-marinho-glow hover:text-brand-marinho-glow transition-all duration-300"
            >
              Acompanhar Obra
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* ── Right Column: Scroll-Synced Video ─────────────────── */}
          <div className="w-full md:flex-1 relative">
            {/* Outer glow frame */}
            <div className="absolute -inset-1 bg-brand-marinho-glow/10 blur-2xl rounded-[2.5rem]" />

            <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] aspect-[9/16] md:aspect-video">
              <video
                ref={videoRef}
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
              >
                <source src="/hero-video.mp4" type="video/mp4" />
              </video>

              {/* Overlay with subtle vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 via-transparent to-brand-dark/20 pointer-events-none" />

              {/* "LIVE" indicator badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-brand-dark/80 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-marinho-glow opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-marinho-glow" />
                </span>
                <span className="font-sans text-[8px] font-black uppercase tracking-[0.3em] text-brand-marinho-glow">
                  Ao Vivo
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
