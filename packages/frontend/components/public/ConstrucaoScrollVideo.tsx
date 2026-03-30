'use client'
import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Building2, Hammer, CheckCircle2 } from 'lucide-react'
import { useLeadModal } from '@/context/LeadModalContext'

const etapas = [
  { icon: Hammer,       label: 'Estrutura'   },
  { icon: Building2,    label: 'Construção'  },
  { icon: CheckCircle2, label: 'Entrega'     },
]

export function ConstrucaoScrollVideo() {
  const { open: openLead } = useLeadModal()
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef     = useRef<HTMLVideoElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let targetTime   = 0
    let velocity     = 0
    let lastTarget   = 0
    let lastScrollAt = 0
    let lastSeekAt   = 0
    let rafId        = 0
    let running      = true

    const FRICTION  = 0.82
    const EWMA      = 0.35
    const SETTLE_MS = 80
    const SEEK_MS   = 33
    const MIN_SEEK  = 0.033
    const EPSILON   = 0.004

    function seekTo(el: HTMLVideoElement, t: number) {
      const v = el as any
      if (typeof v.fastSeek === 'function') v.fastSeek(t)
      else el.currentTime = t
    }

    function warmUp() {
      const v = videoRef.current
      if (!v) return
      v.play()
        .then(() => { const c = videoRef.current; if (c) { c.pause(); c.currentTime = 0 } })
        .catch(() => {})
    }
    video.addEventListener('loadedmetadata', warmUp, { once: true })
    const onPlay = () => { videoRef.current?.pause() }
    video.addEventListener('play', onPlay)

    function tick() {
      if (!running) return
      rafId = requestAnimationFrame(tick)
      const v = videoRef.current
      if (!v || !v.duration || !isFinite(v.duration)) return

      const now     = performance.now()
      const settled = (now - lastScrollAt) > SETTLE_MS

      let seekTarget: number

      if (!settled) {
        seekTarget = targetTime
      } else if (Math.abs(velocity) > EPSILON) {
        targetTime += velocity
        targetTime  = Math.max(0, Math.min(v.duration - 0.033, targetTime))
        velocity   *= FRICTION
        seekTarget  = targetTime
      } else {
        return
      }

      seekTarget = Math.max(0, Math.min(v.duration - 0.033, seekTarget))

      const moved = Math.abs(seekTarget - v.currentTime)
      if (moved >= MIN_SEEK && (now - lastSeekAt) >= SEEK_MS) {
        seekTo(v, seekTarget)
        lastSeekAt = now
      }
    }

    rafId = requestAnimationFrame(tick)

    const unsub = scrollYProgress.on('change', (latest) => {
      const v = videoRef.current
      if (!v || !v.duration || !isFinite(v.duration)) return
      const newTarget = Math.max(0, Math.min(1, (latest - 0.1) / 0.8)) * (v.duration - 0.033)
      const delta  = newTarget - lastTarget
      velocity     = velocity * (1 - EWMA) + delta * EWMA
      lastTarget   = newTarget
      targetTime   = newTarget
      lastScrollAt = performance.now()
    })

    return () => {
      running = false
      cancelAnimationFrame(rafId)
      unsub()
      video.removeEventListener('play', onPlay)
    }
  }, [scrollYProgress])

  const textOpacity = useTransform(scrollYProgress, [0.05, 0.25], [0, 1])
  const barScale    = useTransform(scrollYProgress, [0.1, 0.88],  [0, 1])

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-white">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center gap-8 md:gap-16 pt-24 md:pt-32">

          {/* ── Coluna esquerda: Texto ────────────────────────────── */}
          <motion.div
            style={{ opacity: textOpacity }}
            className="w-full md:w-[45%] shrink-0 flex flex-col items-start"
          >
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <span className="font-sans text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-brand-marinho border-l-2 border-brand-marinho pl-3">
                Em Construção
              </span>
            </div>

            <h2
              className="font-serif font-bold text-brand-navy leading-[1.1] md:leading-[1.05] tracking-tight mb-4 md:mb-6"
              style={{ fontSize: 'clamp(1.5rem, 6vw, 3.5rem)' }}
            >
              Cada detalhe{' '}
              <em className="not-italic text-brand-marinho">
                construído para durar.
              </em>
            </h2>

            <p className="font-sans text-sm md:text-base text-brand-navy/85 leading-relaxed mb-6 md:mb-10 max-w-md">
              Acompanhe a evolução do empreendimento em tempo real. Cada etapa é executada com rigor técnico e acabamento de alto padrão.
            </p>

            <div className="hidden sm:flex flex-col gap-4 mb-10 w-full">
              {etapas.map(({ icon: Icon, label }) => (
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

            <button
              onClick={() => openLead()}
              className="group flex items-center gap-3 font-sans text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-brand-navy border border-brand-navy/20 rounded-full px-5 py-2.5 md:px-6 md:py-3 hover:border-brand-marinho hover:text-brand-marinho transition-all duration-300"
            >
              Acompanhar Obra
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* ── Coluna direita: Vídeo ─────────────────────────────── */}
          <div className="w-full md:flex-1 relative">
            <div className="relative overflow-hidden w-full h-auto">
              <video
                ref={videoRef}
                muted
                playsInline
                autoPlay
                preload="auto"
                disableRemotePlayback
                className="w-full h-auto block"
              >
                <source src="/construct-video-scrub.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
