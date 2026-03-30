'use client'
import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowRight, Building2, Hammer, CheckCircle2 } from 'lucide-react'
import { useLeadModal } from '@/context/LeadModalContext'

// ── Ajuste conforme o total de frames exportados do vídeo ─────────────
const FRAME_COUNT = 120
// Quantos frames precisam falhar para usar o fallback de vídeo
const FALLBACK_THRESHOLD = Math.floor(FRAME_COUNT * 0.5)

const etapas = [
  { icon: Hammer,       label: 'Estrutura'   },
  { icon: Building2,    label: 'Construção'  },
  { icon: CheckCircle2, label: 'Entrega'     },
]

export function ConstrucaoScrollVideo() {
  const { open: openLead } = useLeadModal()

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const videoRef     = useRef<HTMLVideoElement>(null)
  const framesRef    = useRef<HTMLImageElement[]>([])
  const lastIndexRef = useRef(-1)

  const [loadProgress, setLoadProgress] = useState(0)
  const [loaded, setLoaded]             = useState(false)
  const [useFallback, setUseFallback]   = useState(false)

  // ── 1) Pré-carrega todos os frames ──────────────────────────────────
  useEffect(() => {
    let done   = 0
    let errors = 0
    const imgs: HTMLImageElement[] = new Array(FRAME_COUNT)

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image()
      img.onload = () => {
        done++
        setLoadProgress(Math.round((done / FRAME_COUNT) * 100))
        if (done + errors === FRAME_COUNT) {
          framesRef.current = imgs
          setLoaded(true)
        }
      }
      img.onerror = () => {
        errors++
        done++
        if (errors >= FALLBACK_THRESHOLD) {
          // Frames não existem — usa vídeo
          setUseFallback(true)
          setLoaded(true)
          return
        }
        if (done === FRAME_COUNT) {
          framesRef.current = imgs
          setLoaded(true)
        }
      }
      img.src = `/sequence/frame_${i}.webp`
      imgs[i] = img
    }
  }, [])

  // ── 2) Redimensiona canvas quando o container muda de tamanho ───────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function resize() {
      if (!canvas) return
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  // ── 3) Scroll progress + spring suave ───────────────────────────────
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // ── 4) Desenha o frame correto no canvas ─────────────────────────────
  useEffect(() => {
    if (!loaded) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function draw(index: number) {
      const img = framesRef.current[index]
      if (!img?.complete || !img.naturalWidth) return

      const cw = canvas!.width
      const ch = canvas!.height
      const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight)
      const dw = img.naturalWidth  * scale
      const dh = img.naturalHeight * scale
      const dx = (cw - dw) / 2
      const dy = (ch - dh) / 2

      ctx!.clearRect(0, 0, cw, ch)
      ctx!.drawImage(img, dx, dy, dw, dh)
    }

    // Desenha o frame inicial
    draw(0)

    const unsub = smoothProgress.on('change', (v) => {
      // Mapeia 10%–90% do scroll para 0–1
      const mapped = Math.max(0, Math.min(1, (v - 0.1) / 0.8))
      const index  = Math.min(Math.floor(mapped * FRAME_COUNT), FRAME_COUNT - 1)

      // Evita redesenhar o mesmo frame
      if (index === lastIndexRef.current) return
      lastIndexRef.current = index
      draw(index)
    })

    return () => unsub()
  }, [smoothProgress, loaded, useFallback])

  // ── 5) Fallback: seek no vídeo quando frames não existem ─────────────
  useEffect(() => {
    if (!useFallback) return
    const video = videoRef.current
    if (!video) return

    // Warm-up iOS
    const warmUp = () => {
      video.play().then(() => { video.pause(); video.currentTime = 0 }).catch(() => {})
    }
    video.addEventListener('loadedmetadata', warmUp, { once: true })
    const onPlay = () => video.pause()
    video.addEventListener('play', onPlay)

    const unsub = smoothProgress.on('change', (v) => {
      if (!video.duration || !isFinite(video.duration)) return
      const mapped = Math.max(0, Math.min(1, (v - 0.1) / 0.8))
      const t = mapped * (video.duration - 0.033)
      if (typeof (video as any).fastSeek === 'function') (video as any).fastSeek(t)
      else video.currentTime = t
    })

    return () => {
      unsub()
      video.removeEventListener('play', onPlay)
    }
  }, [smoothProgress, useFallback])

  // ── Transforms para texto e barra (sem mudança) ──────────────────────
  const textOpacity = useTransform(scrollYProgress, [0.05, 0.25], [0, 1])
  const barScale    = useTransform(scrollYProgress, [0.1, 0.88],  [0, 1])

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-white">

      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">

        {/* ── Loading overlay ──────────────────────────────────────── */}
        {!loaded && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white gap-6">
            <div className="w-6 h-6 border-2 border-brand-marinho border-t-transparent rounded-full animate-spin" />
            <div className="w-48 h-0.5 bg-brand-navy/10 relative overflow-hidden rounded-full">
              <div
                className="absolute inset-y-0 left-0 bg-brand-marinho transition-all duration-150 rounded-full"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center gap-8 md:gap-16 pt-24 md:pt-32">

          {/* ── Coluna esquerda: Texto (sem alteração) ────────────── */}
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

            {/* Construction Steps */}
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

          {/* ── Coluna direita: Canvas ou Vídeo (fallback) ───────── */}
          <div className="w-full md:flex-1 relative">
            {useFallback ? (
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
            ) : (
              <canvas
                ref={canvasRef}
                className="w-full block"
                style={{ aspectRatio: '16/9' }}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
