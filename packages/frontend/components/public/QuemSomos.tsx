'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import { Shield, TrendingUp, Award, MapPin } from 'lucide-react'

const marcos = [
  {
    ano: '2016',
    titulo: 'Fundação',
    descricao: 'Nasce a Queiroz Almeida em Pernambuco, com foco exclusivo no litoral.',
  },
  {
    ano: '2019',
    titulo: 'Primeira entrega',
    descricao: 'Porto Lagoa Residence — pioneiro em flats de investimento na região.',
  },
  {
    ano: '2022',
    titulo: 'Expansão para Alagoas',
    descricao: 'Chegada a Maragogi com o empreendimento Caminho do Mar.',
  },
  {
    ano: '2025',
    titulo: '3 obras simultâneas',
    descricao: 'Três empreendimentos em construção simultânea, consolidando a liderança.',
  },
]

interface TimelineItemProps {
  marco: typeof marcos[0]
  index: number
}

function TimelineItem({ marco, index }: TimelineItemProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    margin: "-48% 0px -48% 0px" // Adjusted to 'hit' exactly when the bar arrives
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex flex-col ${index % 2 === 0 ? 'md:items-start' : 'md:items-end'} pl-12 md:pl-0`}
    >
      {/* Node with Ring Effect — Active Detection */}
      <div className="absolute left-4 md:left-1/2 top-0 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
         <div className="relative">
            <motion.div 
              animate={{ 
                backgroundColor: isInView ? '#22D3EE' : '#0E7490',
                scale: isInView ? 1.2 : 1,
                boxShadow: isInView ? '0 0 20px rgba(34,211,238,0.8)' : 'none'
              }}
              transition={{ duration: 0.6, delay: isInView ? 0.1 : 0 }}
              className="w-4 h-4 md:w-5 md:h-5 rounded-full border-4 border-white z-30" 
            />
            {isInView && (
              <motion.div 
                layoutId="node-pulse"
                className="absolute -inset-2 rounded-full border border-brand-marinho-glow"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
              />
            )}
         </div>
      </div>

      {/* Content Card with Scroll Auto-Highlight */}
      <div className="w-full md:w-[45%] relative group">
        <span className={`font-serif text-[3.5rem] md:text-[5rem] font-black absolute -top-24 md:-top-40 left-4 md:left-8 pointer-events-none z-0 transition-all duration-700
          ${isInView ? 'text-brand-navy/30 -translate-y-2 opacity-100' : 'text-brand-navy/15 translate-y-0 opacity-60'}
        `}
        style={{ transitionDelay: isInView ? '200ms' : '0ms' }}>
          {marco.ano}
        </span>
        
        <div className={`bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 transition-all duration-700 relative z-10 border
          ${isInView 
            ? 'border-brand-marinho-glow shadow-brand-marinho-glow/10 scale-[1.03] translate-y-[-4px]' 
            : 'border-brand-navy/5 shadow-[0_30px_80px_-20px_rgba(10,17,40,0.06)] translate-y-0'
          }
        `}
        style={{ transitionDelay: isInView ? '150ms' : '0ms' }}>
          <h4 className={`font-serif font-bold text-xl md:text-2xl mb-3 md:mb-5 relative z-10 transition-colors duration-500 ${isInView ? 'text-brand-marinho' : 'text-brand-navy'}`}>
            {marco.titulo}
          </h4>
          <p className="font-sans text-brand-navy/50 leading-relaxed relative z-10 text-xs md:text-base">
            {marco.descricao}
          </p>
          
          {/* Architectural connector */}
          <div className={`absolute top-0 ${index % 2 === 0 ? '-right-6' : '-left-6'} w-12 h-px bg-brand-marinho-glow/20 hidden md:block ${isInView ? 'opacity-100 animate-pulse' : 'opacity-0'} transition-opacity duration-700`}
               style={{ transitionDelay: isInView ? '400ms' : '0ms' }} />
        </div>
      </div>
    </motion.div>
  )
}

export function QuemSomos() {
  const containerRef = useRef<HTMLElement>(null)
  
  // Dedicated sensor for the Timeline line
  const timelineRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  })

  // Precision tracking for the vertical line
  const { scrollYProgress: localTimelineProgress } = useScroll({
    target: timelineRef,
    offset: ['start center', 'end center']
  })

  // Smooth Parallax for Numbers
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -100])
  const parallaxYReverse = useTransform(scrollYProgress, [0, 1], [-50, 50])
  const smoothParallaxY = useSpring(parallaxY, { stiffness: 100, damping: 30 })
  const smoothParallaxYReverse = useSpring(parallaxYReverse, { stiffness: 100, damping: 30 })

  // Timeline Progress 1:1
  const timelineHeight = useTransform(localTimelineProgress, [0, 1], [0, 1])
  const smoothTimelineProgress = useSpring(timelineHeight, { stiffness: 30, damping: 25 })

  return (
    <section ref={containerRef} id="quem-somos" className="bg-white overflow-hidden relative py-24 lg:py-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">

        {/* ... Header and Bento Grid ... */}
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-start mb-24 lg:mb-32">
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-brand-marinho block mb-8 border-l-2 border-brand-marinho pl-4 leading-none"
            >
              Quem Somos
            </motion.span>

            <div className="overflow-hidden">
              <motion.h2
                initial={{ y: '100%' }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif font-bold text-brand-navy leading-[1.05] tracking-tight"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
              >
                Solidez que{' '}
                <em className="not-italic text-brand-marinho font-medium">atravessa</em>{' '}
                gerações.
              </motion.h2>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col gap-6 lg:pt-8"
          >
            <p className="font-sans text-lg text-brand-navy/60 leading-relaxed">
              A <strong className="text-brand-navy font-semibold">Queiroz Almeida Construtora e Incorporadora</strong> é reconhecida no mercado do litoral nordestino pela excelência na construção de flats de investimento de altíssimo padrão.
            </p>
            <p className="font-sans text-base text-brand-navy/40 leading-relaxed">
              Fundada em 2016, a empresa atua no Litoral Sul Pernambucano (Porto de Galinhas) e no Litoral Norte Alagoano (Maragogi), entregando ativos imobiliários que combinam qualidade construtiva, localização privilegiada e alto potencial de valorização.
            </p>
          </motion.div>
        </div>

        {/* Diferenciais — Architectural Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-32">
          {/* Card 1: 10+ Years (Large) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 group bg-brand-dark rounded-[2.5rem] p-10 relative overflow-hidden border border-white/5 shadow-2xl"
          >
            <div className="absolute inset-0 bg-blueprint opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-700" />
            
            {/* Parallax Number */}
            <motion.span 
              style={{ y: smoothParallaxY }}
              className="font-sans text-[7rem] md:text-[11rem] font-black text-brand-marinho-glow/15 absolute top-0 right-10 leading-none pointer-events-none italic"
            >
              10+
            </motion.span>

            <div className="relative z-10">
              <div className="pt-10">
                <Shield size={32} className="text-brand-marinho-glow mb-8" />
                <h3 className="font-serif font-bold text-white text-3xl mb-4">Anos de Mercado</h3>
                <p className="font-sans text-brand-silver/50 leading-relaxed max-w-sm">
                  Uma década de solidez e reputação inabalável no litoral nordestino.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Potencial */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 group bg-brand-marinho/5 border border-brand-marinho/20 rounded-[2.5rem] p-10 relative overflow-hidden"
          >
             {/* Shimmer Light Sweep */}
             <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent rotate-45 group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
             
             <div className="relative z-10">
               <TrendingUp size={40} className="text-brand-marinho-glow mb-10 group-hover:scale-110 transition-transform" />
               <h3 className="font-serif font-bold text-brand-navy text-3xl mb-4">Potencial de Renda</h3>
               <p className="font-sans text-brand-navy/60 leading-relaxed">
                 Flats em Porto de Galinhas e Maragogi — os destinos com maior valorização imobiliária do Brasil.
               </p>
             </div>
          </motion.div>

          {/* Card 3: Qualidade (Animated Scanner) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 group bg-slate-50 border border-brand-navy/5 rounded-[2.5rem] p-10 relative overflow-hidden hover:bg-white transiton-colors duration-500"
          >
            {/* Animated Scanning Line */}
            <motion.div 
               animate={{ y: [0, 400, 0] }}
               transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
               className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-marinho-glow/20 to-transparent pointer-events-none" 
            />

            <div className="relative z-10">
              <span className="font-serif text-[10px] font-black uppercase tracking-[0.4em] text-brand-marinho mb-6 block">
                Standard Premium
              </span>
              <h3 className="font-serif font-bold text-brand-navy text-3xl mb-4 leading-tight">
                Padrão <br/> Construtivo
              </h3>
              <p className="font-sans text-brand-navy/40 leading-relaxed">
                Projetos que aliam rigor arquitetônico a localizações estratégicas.
              </p>
            </div>
            
            <div className="absolute bottom-6 right-6 w-16 h-16 opacity-10">
              <div className="absolute top-8 left-0 w-full h-px bg-brand-navy" />
              <div className="absolute top-0 left-8 h-full w-px bg-brand-navy" />
            </div>
          </motion.div>

          {/* Card 4: Estados (Parallax 02) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 group bg-brand-dark rounded-[2.5rem] p-10 relative overflow-hidden"
          >
            <motion.span 
              style={{ x: smoothParallaxYReverse }}
              className="font-sans text-[12rem] font-black text-white/5 absolute -bottom-10 right-2 leading-none pointer-events-none"
            >
              02
            </motion.span>

            <div className="relative z-10 flex flex-col justify-between h-full">
              <MapPin size={32} className="text-brand-marinho-glow mb-12" />
              <div>
                <h3 className="font-serif font-bold text-white text-3xl mb-3">Litoral Único</h3>
                <p className="font-sans text-brand-silver/50 text-sm leading-relaxed max-w-xs">
                  Pernambuco e Alagoas: uma atuação focada onde o mar é a maior riqueza da marca.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Cinematic Vertical Timeline — Precision Scrolling */}
        <div className="relative border-t border-brand-navy/5 pt-32 lg:pt-48 pb-20">
          <div className="max-w-4xl mx-auto relative px-4 md:px-0">
             <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="font-sans text-[11px] font-black uppercase tracking-[0.5em] text-brand-marinho block mb-32 text-center"
              >
                Nossa Trajetória
              </motion.span>

              {/* Milestones Container with Dedicated Scroll Sensor */}
              <div ref={timelineRef} className="relative">
                {/* Vertical Progress Bar — Precision Linked */}
                <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-brand-navy/5 -translate-x-1/2 md:block" />
                <motion.div 
                  style={{ scaleY: smoothTimelineProgress }}
                  className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-brand-marinho-glow -translate-x-1/2 md:block origin-top z-10" 
                />

                <div className="space-y-48 relative">
                  {marcos.map((m, i) => (
                    <TimelineItem key={m.ano} marco={m} index={i} />
                  ))}
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Background Blueprint Grid — Cinematic Effect */}
      <div className="absolute inset-x-0 top-0 bottom-0 bg-blueprint opacity-[0.02] pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none" />
    </section>
  )
}
