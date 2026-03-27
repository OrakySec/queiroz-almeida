'use client'
import { useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Reveal, RevealText } from './RevealText'
import { EmpreendimentoCard } from './EmpreendimentoCard'
import type { Empreendimento } from '@/types'

interface Props {
  empreendimentos: Empreendimento[]
}

export function EmpreendimentosSection({ empreendimentos }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  })

  return (
    <section className="bg-white py-24 lg:py-40 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header Columnar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-end mb-20">
          <div className="md:col-span-8">
            <RevealText>
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-brand-marinho mb-6 block border-l-2 border-brand-marinho-glow pl-4 leading-none">
                Curadoria de Elite
              </span>
            </RevealText>
            <RevealText delay={0.1}>
              <h2 className="font-serif font-bold text-brand-navy leading-[1.1] mt-3"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
                Nosso Portfólio de <br/> <span className="text-brand-marinho-glow italic font-medium">Investimentos.</span>
              </h2>
            </RevealText>
          </div>

          {/* Navigation Controls */}
          <div className="md:col-span-4 flex justify-start md:justify-end gap-3">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              className="w-14 h-14 rounded-full border border-brand-navy/10 text-brand-navy hover:bg-brand-marinho hover:text-white hover:border-brand-marinho transition-all flex items-center justify-center group"
              aria-label="Anterior"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              className="w-14 h-14 rounded-full border border-brand-navy/10 text-brand-navy hover:bg-brand-marinho hover:text-white hover:border-brand-marinho transition-all flex items-center justify-center group"
              aria-label="Próximo"
            >
              <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Cinematic Carousel */}
        <div className="overflow-visible relative" ref={emblaRef}>
          <div className="flex gap-10 pl-1 pb-12">
            {empreendimentos.map((e, i) => (
              <Reveal key={e.id} delay={0.05 * i} direction="up">
                <EmpreendimentoCard empreendimento={e} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-12 flex justify-start md:justify-end border-t border-brand-navy/5 pt-12">
          <Link
            href="/empreendimentos"
            className="group flex items-center gap-4 font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-brand-navy hover:text-brand-marinho transition-colors"
          >
            Ver Catálogo Completo
            <div className="w-10 h-10 rounded-full border border-brand-navy/10 flex items-center justify-center group-hover:bg-brand-marinho group-hover:text-white group-hover:border-brand-marinho transition-all">
              <ArrowRight size={16} />
            </div>
          </Link>
        </div>
      </div>
      
      {/* Decorative Blueprint Background element */}
      <div className="absolute bottom-0 right-0 w-1/4 h-1/2 bg-blueprint opacity-[0.03] pointer-events-none -z-10" />
    </section>
  )
}
