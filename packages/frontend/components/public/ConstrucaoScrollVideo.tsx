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
  const textOpacity = useTransform(scrollYProgress, [0.05, 0.25], [0, 1])

  // Progress bar fills as scroll advances
  const barScale = useTransform(scrollYProgress, [0.1, 0.88], [0, 1])

  return (
    // 400vh outer container — user must scroll through it entirely
    <div ref={containerRef} className="relative h-[400vh] bg-white">

      {/* Sticky inner frame — stays fixed while user scrolls */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center gap-8 md:gap-16 pt-24 md:pt-32">

          {/* ── Left Column: Text ─────────────────────────────────── */}
          <motion.div
            style={{ opacity: textOpacity }}
            className="w-full md:w-[45%] shrink-0 flex flex-col items-start"
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <span className="font-sans text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-brand-marinho border-l-2 border-brand-marinho pl-3">
                Em Construção
              </span>
            </div>

            {/* Headline */}
            <h2
              className="font-serif font-bold text-brand-navy leading-[1.1] md:leading-[1.05] tracking-tight mb-4 md:mb-6"
              style={{ fontSize: 'clamp(1.5rem, 6vw, 3.5rem)' }}
            >
              Cada detalhe{' '}
              <em className="not-italic text-brand-marinho">
                construído para durar.
              </em>
            </h2>

            {/* Body */}
            <p className="font-sans text-sm md:text-base text-brand-navy/85 leading-relaxed mb-6 md:mb-10 max-w-md">
              Acompanhe a evolução do empreendimento em tempo real. Cada etapa é executada com rigor técnico e acabamento de alto padrão.
            </p>

            {/* Construction Steps — More compact on mobile */}
            <div className="hidden sm:flex flex-col gap-4 mb-10 w-full">
              {etapas.map(({ icon: Icon, label }, i) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full border border-brand-marinho/20 bg-brand-marinho/5 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-brand-marinho" />
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-brand-navy/65">
                      {label}
                    </span>
                    <div className="flex-1 h-px bg-brand-navy/10" />
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar — synced with scroll */}
            <div className="w-full mb-6 md:mb-8">
              <div className="flex justify-between mb-2">
                <span className="font-sans text-[8px] md:text-[9px] font-black uppercase tracking-widest text-brand-navy/55">
                  Progresso da Obra
                </span>
                <span className="font-sans text-[8px] md:text-[9px] font-black uppercase tracking-widest text-brand-marinho font-bold">
                  Em Evolução
                </span>
              </div>
              <div className="h-px w-full bg-brand-navy/10 relative overflow-hidden rounded-full">
                <motion.div
                  style={{ scaleX: barScale }}
                  className="absolute inset-0 bg-gradient-to-r from-brand-marinho to-brand-marinho-glow origin-left"
                />
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => openLead()}
              className="group flex items-center gap-3 font-sans text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-brand-navy border border-brand-navy/20 rounded-full px-5 py-2.5 md:px-6 md:py-3 hover:border-brand-marinho hover:text-brand-marinho transition-all duration-300"
            >
              Acompanhar Obra
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* ── Right Column: Scroll-Synced Video ─────────────────── */}
          <div className="w-full md:flex-1 relative">
            <div className="relative overflow-hidden w-full h-auto rounded-2xl md:rounded-0 border border-brand-navy/5 md:border-none">
              <video
                ref={videoRef}
                muted
                playsInline
                preload="metadata"
                poster="/construct-video-poster.jpg"
                className="w-full h-auto block"
              >
                <source src="/construct-video-scrub-ios.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
