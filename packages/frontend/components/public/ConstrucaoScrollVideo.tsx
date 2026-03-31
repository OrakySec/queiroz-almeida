'use client'
import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { ArrowRight, Building2, Hammer, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

const etapas = [
  { icon: Hammer,       label: 'Sólida Fundação',    sub: 'Estabilidade e Alma do Projeto' },
  { icon: Building2,    label: 'Engenharia Superior', sub: 'Onde o Design Ganha Forma'    },
  { icon: CheckCircle2, label: 'Excelência & Chaves', sub: 'A Celebração do Seu Destino'  },
]

export function ConstrucaoScrollVideo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef     = useRef<HTMLVideoElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  // iOS warm-up: desbloqueia o decoder antes do usuário scrollar
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const warmUp = () => {
      video.play()
        .then(() => { video.pause(); video.currentTime = 0 })
        .catch(() => {})
    }
    video.addEventListener('loadedmetadata', warmUp, { once: true })
    const onPlay = () => { video.pause() }
    video.addEventListener('play', onPlay)
    return () => { video.removeEventListener('play', onPlay) }
  }, [])

  // Seek direto — funciona perfeitamente com vídeo encodado com -g 1 (todo frame é keyframe)
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const video = videoRef.current
    if (!video || !Number.isFinite(video.duration)) return
    const mapped = Math.max(0, Math.min(1, (latest - 0.1) / 0.8))
    video.currentTime = Math.min(mapped * video.duration, video.duration - 0.05)
  })

  const textOpacity = useTransform(scrollYProgress, [0.05, 0.25], [0, 1])
  const barScale    = useTransform(scrollYProgress, [0.1, 0.88],  [0, 1])

  // Lógica de Ativação das Etapas (0, 1, 2) baseada no scroll
  const step1Opacity = useTransform(scrollYProgress, [0.1, 0.2, 0.4, 0.5], [0.4, 1, 1, 0.4])
  const step2Opacity = useTransform(scrollYProgress, [0.4, 0.5, 0.7, 0.8], [0.4, 1, 1, 0.4])
  const step3Opacity = useTransform(scrollYProgress, [0.7, 0.8, 0.9, 1.0], [0.4, 1, 1, 1.0])

  const stepOpacities = [step1Opacity, step2Opacity, step3Opacity]

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-white">
      <div className="sticky top-0 h-screen w-full flex items-center">

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center gap-2 md:gap-8 pt-8 md:pt-12">

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
              className="font-serif font-bold text-brand-navy leading-[1.1] md:leading-[1.05] tracking-tight mb-2"
              style={{ fontSize: 'clamp(1.5rem, 6vw, 3.5rem)' }}
            >
              Cada detalhe{' '}
              <em className="not-italic text-brand-marinho">
                construído para durar.
              </em>
            </h2>

            <p className="font-sans text-xs md:text-sm text-brand-navy/85 leading-relaxed mb-3 md:mb-4 max-w-md">
              Acompanhe a evolução do empreendimento em tempo real. Cada etapa é executada com rigor técnico e acabamento de alto padrão.
            </p>

            <div className="hidden sm:flex flex-col gap-4 mb-4 w-full relative">
              {/* Linha de Trilho Vertical */}
              <div className="absolute left-4 top-4 bottom-4 w-px bg-brand-navy/5" />
              
              {etapas.map(({ icon: Icon, label, sub }, i) => (
                <motion.div 
                  key={label} 
                  style={{ opacity: stepOpacities[i] }}
                  className="flex items-start gap-6 group relative transition-all duration-500"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full border border-brand-marinho/20 bg-white flex items-center justify-center shrink-0 relative z-10 group-hover:border-brand-marinho transition-colors">
                      <Icon size={14} className="text-brand-marinho" />
                    </div>
                    {/* Efeito Glow quando ativo (simulado pela opacidade do motion.div) */}
                    <div className="absolute inset-0 bg-brand-marinho/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="font-sans text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-brand-navy leading-tight">
                      {label}
                    </span>
                    <span className="font-sans text-[8px] md:text-[9px] font-bold text-brand-navy/40 uppercase tracking-widest">
                      {sub}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="w-full mb-3 md:mb-4">
              <div className="flex justify-between mb-1">
                <span className="font-sans text-[7px] md:text-[8px] font-black uppercase tracking-widest text-brand-navy/55">
                  Progresso da Obra
                </span>
                <span className="font-sans text-[7px] md:text-[8px] font-black uppercase tracking-widest text-brand-marinho font-bold">
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

            <Link
              href="/empreendimentos"
              className="group flex items-center gap-3 font-sans text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-brand-navy border border-brand-navy/20 rounded-full px-4 py-2 md:px-5 md:py-2.5 hover:border-brand-marinho hover:text-brand-marinho transition-all duration-300 w-fit"
            >
              Ver obras em andamento
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
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
