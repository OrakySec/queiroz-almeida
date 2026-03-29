'use client'
import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
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

  // ── Smooth video scrubbing: RAF loop + exponential lerp ────────
  // Problema original: setar video.currentTime direto em cada evento de scroll
  // faz o browser decodificar um keyframe por evento → trava, especialmente iOS.
  //
  // Solução: mantemos `animTime` como nosso estado interno e usamos um loop
  // requestAnimationFrame que suaviza (lerp 12%/frame) em direção a `targetTime`.
  // O browser processa seeks em ritmo sustentável ao invés de "pular" a cada pixel.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let animTime     = 0
    let targetTime   = 0
    let lastTarget   = 0
    let velocity     = 0
    let pendingDelta = 0
    let lastScrollAt = 0
    let rafId = 0
    let running = true

    const LERP      = 0.15   // 15%/frame durante scroll ativo
    const FRICTION  = 0.85   // momentum ~20 frames (330ms)
    const EWMA      = 0.4    // suavização da velocity real
    const SETTLE_MS = 60     // ms sem scroll → fase de inércia
    const MIN_SEEK  = 0.066  // seek só quando acumulou ≥ 2 frames (30fps) — alivia mobile
    const EPSILON   = 0.005

    // Usa fastSeek() onde disponível (Firefox/Chrome Android): menos preciso
    // mas muito mais rápido que currentTime em mobile
    function seekTo(el: HTMLVideoElement, t: number) {
      const v = el as any
      if (typeof v.fastSeek === 'function') v.fastSeek(t)
      else el.currentTime = t
    }

    // ── iOS warm-up ──────────────────────────────────────────────────────
    // iOS Safari ignora preload="auto" e não decodifica NENHUM frame até que
    // o vídeo tenha sido play()'ed ao menos uma vez. Fazemos um play() silencioso
    // no loadedmetadata e pausamos imediatamente — o decoder fica "aquecido"
    // e currentTime scrubbing passa a funcionar normalmente.
    function warmUp() {
      const v = videoRef.current
      if (!v) return
      const p = v.play()
      if (p) p.then(() => {
        const cur = videoRef.current
        if (cur) { cur.pause(); cur.currentTime = 0 }
      }).catch(() => {})
    }
    video.addEventListener('loadedmetadata', warmUp, { once: true })

    // Mantém o vídeo sempre pausado (scrubbing manual via currentTime)
    function onPlay() { videoRef.current?.pause() }
    video.addEventListener('play', onPlay)

    function tick() {
      if (!running) return
      rafId = requestAnimationFrame(tick)
      const v = videoRef.current
      if (!v || !v.duration || !isFinite(v.duration)) return

      const settled = (performance.now() - lastScrollAt) > SETTLE_MS

      if (!settled) {
        // ── Fase 1: scroll ativo — lerp ──
        const diff = targetTime - animTime
        if (Math.abs(diff) < EPSILON) return
        animTime += diff * LERP
        animTime = Math.max(0, Math.min(v.duration - 0.033, animTime))
        seekTo(v, animTime)

      } else if (Math.abs(velocity) > EPSILON) {
        // ── Fase 2: inércia — batching de seeks ──
        pendingDelta += velocity
        velocity *= FRICTION
        if (Math.abs(pendingDelta) >= MIN_SEEK) {
          animTime += pendingDelta
          animTime = Math.max(0, Math.min(v.duration - 0.033, animTime))
          seekTo(v, animTime)
          pendingDelta = 0
        }

      } else {
        // ── Fase 3: snap final ──
        pendingDelta = 0
        if (Math.abs(targetTime - animTime) > EPSILON) {
          animTime = targetTime
          velocity = 0
          seekTo(v, animTime)
        }
      }
    }

    rafId = requestAnimationFrame(tick)

    const unsub = scrollYProgress.on('change', (latest) => {
      const v = videoRef.current
      if (!v || !v.duration || !isFinite(v.duration)) return
      const newTarget = Math.max(0, Math.min(1, (latest - 0.1) / 0.8)) * (v.duration - 0.033)
      const delta = newTarget - lastTarget
      velocity = velocity * (1 - EWMA) + delta * EWMA
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
