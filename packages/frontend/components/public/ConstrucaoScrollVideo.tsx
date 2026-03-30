'use client'
import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Building2, Hammer, CheckCircle2 } from 'lucide-react'
import { useLeadModal } from '@/context/LeadModalContext'

// ── Ajuste conforme o total de frames exportados do vídeo ─────────────
const FRAME_COUNT = 151
// Se mais da metade dos frames falhar ao carregar → usa vídeo como fallback
const FALLBACK_THRESHOLD = Math.floor(FRAME_COUNT * 0.5)

// Fator de lerp: quão rápido o frame atual persegue o frame alvo
// Desktop: 0.08 → inércia longa e suave
// Mobile:  0.16 → mais ágil (OS já dá inércia via momentum nativo)
const LERP_DESKTOP = 0.08
const LERP_MOBILE  = 0.16

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

  // Desktop: ImageBitmap[] (GPU) | Mobile: HTMLImageElement[] (RAM)
  const framesRef   = useRef<(ImageBitmap | HTMLImageElement)[]>([])
  const isMobileRef = useRef(false)

  const [loadProgress, setLoadProgress] = useState(0)
  const [loaded, setLoaded]             = useState(false)
  const [useFallback, setUseFallback]   = useState(false)

  // ── 1) Pré-carrega frames ────────────────────────────────────────────
  useEffect(() => {
    // pointer: coarse = tela touch (celular/tablet)
    isMobileRef.current = window.matchMedia('(pointer: coarse)').matches

    let completed = 0
    let errors    = 0
    const htmlImgs: HTMLImageElement[] = new Array(FRAME_COUNT)

    async function finalize(imgs: HTMLImageElement[]) {
      if (isMobileRef.current) {
        // Mobile: mantém HTMLImageElement para economizar memória GPU
        framesRef.current = imgs
      } else {
        // Desktop: converte para ImageBitmap (decodificado na GPU)
        // drawImage() vira um blit direto, sem custo de decodificação
        try {
          framesRef.current = await Promise.all(
            imgs.map(img =>
              img.complete && img.naturalWidth
                ? createImageBitmap(img)
                : Promise.resolve(img),
            ),
          )
        } catch {
          framesRef.current = imgs // fallback silencioso para HTMLImageElement
        }
      }
      setLoaded(true)
    }

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image()

      img.onload = () => {
        completed++
        setLoadProgress(Math.round((completed / FRAME_COUNT) * 100))
        if (completed === FRAME_COUNT) finalize(htmlImgs)
      }

      img.onerror = () => {
        errors++
        completed++
        // Se a maioria falhou, os frames não existem → usa vídeo
        if (errors >= FALLBACK_THRESHOLD) {
          setUseFallback(true)
          setLoaded(true)
          return
        }
        setLoadProgress(Math.round((completed / FRAME_COUNT) * 100))
        if (completed === FRAME_COUNT) finalize(htmlImgs)
      }

      img.src = `/sequence/frame_${i}.jpg`
      htmlImgs[i] = img
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

  // ── 3) Scroll progress ───────────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  // ── 4) RAF loop com lerp — canvas ────────────────────────────────────
  //
  // A cada tick (60fps, sincronizado com o monitor):
  //   currentProgress += (targetProgress - currentProgress) × LERP
  //   → currentProgress se aproxima do alvo com desaceleração natural
  //   → quando o scroll para, currentProgress continua se movendo
  //     até estabilizar = INÉRCIA
  //
  // Desktop (LERP 0.08): animação "pesada", inércia longa
  // Mobile  (LERP 0.16): animação ágil, inércia curta (OS já dá momentum)
  useEffect(() => {
    if (!loaded || useFallback) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const LERP = isMobileRef.current ? LERP_MOBILE : LERP_DESKTOP

    let currentProgress = 0
    let targetProgress  = 0
    let lastDrawnIndex  = -1
    let rafId           = 0
    let running         = true

    function draw(index: number) {
      const frame = framesRef.current[index]
      if (!frame) return

      const isImg = frame instanceof HTMLImageElement
      if (isImg && (!frame.complete || !frame.naturalWidth)) return

      const fw = isImg ? frame.naturalWidth  : (frame as ImageBitmap).width
      const fh = isImg ? frame.naturalHeight : (frame as ImageBitmap).height
      const cw = canvas!.width
      const ch = canvas!.height

      const scale = Math.min(cw / fw, ch / fh)
      const dw    = fw * scale
      const dh    = fh * scale
      const dx    = (cw - dw) / 2
      const dy    = (ch - dh) / 2

      ctx!.clearRect(0, 0, cw, ch)
      ctx!.drawImage(frame as CanvasImageSource, dx, dy, dw, dh)
    }

    function tick() {
      if (!running) return
      rafId = requestAnimationFrame(tick)

      const diff = targetProgress - currentProgress
      // Para quando já está próximo o suficiente (< 0.02% do range)
      if (Math.abs(diff) < 0.0002) return

      currentProgress += diff * LERP

      const index = Math.min(
        Math.floor(currentProgress * FRAME_COUNT),
        FRAME_COUNT - 1,
      )

      if (index !== lastDrawnIndex) {
        lastDrawnIndex = index
        draw(index)
      }
    }

    draw(0)
    rafId = requestAnimationFrame(tick)

    const unsub = scrollYProgress.on('change', v => {
      targetProgress = Math.max(0, Math.min(1, (v - 0.1) / 0.8))
    })

    return () => {
      running = false
      cancelAnimationFrame(rafId)
      unsub()
    }
  }, [loaded, useFallback, scrollYProgress])

  // ── 5) Fallback: seek no vídeo (também com RAF + lerp) ───────────────
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

    let currentTime = 0
    let targetTime  = 0
    let rafId       = 0
    let running     = true

    function tick() {
      if (!running) return
      rafId = requestAnimationFrame(tick)
      if (!video.duration || !isFinite(video.duration)) return

      const diff = targetTime - currentTime
      if (Math.abs(diff) < 0.001) return

      currentTime += diff * 0.12
      if (typeof (video as any).fastSeek === 'function') (video as any).fastSeek(currentTime)
      else video.currentTime = currentTime
    }

    rafId = requestAnimationFrame(tick)

    const unsub = scrollYProgress.on('change', v => {
      if (!video.duration || !isFinite(video.duration)) return
      const mapped = Math.max(0, Math.min(1, (v - 0.1) / 0.8))
      targetTime = mapped * (video.duration - 0.033)
    })

    return () => {
      running = false
      cancelAnimationFrame(rafId)
      unsub()
      video.removeEventListener('play', onPlay)
    }
  }, [useFallback, scrollYProgress])

  // ── Transforms para texto e barra ────────────────────────────────────
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

          {/* ── Coluna esquerda: Texto ────────────────────────────── */}
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

            {/* Progress bar — synced com scroll */}
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
