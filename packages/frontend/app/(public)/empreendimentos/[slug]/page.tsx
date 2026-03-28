import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { MapPin, Maximize2, BedDouble, Car } from 'lucide-react'
import { RevealText, Reveal, RevealImage } from '@/components/public/RevealText'
import { LeadCTAButton } from '@/components/public/LeadCTAButton'
import type { Empreendimento } from '@/types'

async function getEmpreendimento(slug: string): Promise<Empreendimento | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/empreendimentos/${slug}`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const e = await getEmpreendimento(params.slug)
  if (!e) return { title: 'Empreendimento não encontrado' }
  return {
    title: e.nome,
    description: e.descricao?.slice(0, 160) || `${e.nome} em ${e.cidade}`,
  }
}

export default async function EmpreendimentoPage({
  params,
}: {
  params: { slug: string }
}) {
  const e = await getEmpreendimento(params.slug)
  if (!e) notFound()

  const fotos = e.fotos || []
  const fotoPrincipal = fotos[0]

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-end bg-brand-dark overflow-hidden">
        {fotoPrincipal && (
          <Image
            src={fotoPrincipal}
            alt={e.nome}
            fill
            className="object-cover opacity-40"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-16 pt-40 w-full">
          <RevealText>
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-dourado">
              {e.is_lancamento ? 'Lançamento' : 'Empreendimento'}
            </span>
          </RevealText>
          <RevealText delay={0.1}>
            <h1 className="font-serif font-bold text-5xl md:text-6xl text-white mt-3 leading-tight">
              {e.nome}
            </h1>
          </RevealText>
          <Reveal delay={0.2}>
            <div className="flex items-center gap-2 mt-4 text-white/60">
              <MapPin size={16} className="text-brand-dourado" />
              <span className="font-sans text-base">{e.cidade}{e.estado ? `, ${e.estado}` : ''}</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Coluna principal */}
            <div className="lg:col-span-2">
              {/* Especificações */}
              <Reveal>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
                  {e.area_min && (
                    <div className="bg-brand-gelo rounded-xl p-4 text-center border border-brand-borda">
                      <Maximize2 size={20} className="text-brand-dourado mx-auto mb-2" />
                      <p className="font-serif font-bold text-lg text-brand-azul">
                        {e.area_min}{e.area_max && e.area_max !== e.area_min ? `–${e.area_max}` : ''} m²
                      </p>
                      <p className="font-sans text-xs text-brand-texto/60">Área</p>
                    </div>
                  )}
                  {e.tipologia && (
                    <div className="bg-brand-gelo rounded-xl p-4 text-center border border-brand-borda">
                      <BedDouble size={20} className="text-brand-dourado mx-auto mb-2" />
                      <p className="font-serif font-bold text-lg text-brand-azul">{e.tipologia}</p>
                      <p className="font-sans text-xs text-brand-texto/60">Tipologia</p>
                    </div>
                  )}
                  {e.total_unidades && (
                    <div className="bg-brand-gelo rounded-xl p-4 text-center border border-brand-borda">
                      <Car size={20} className="text-brand-dourado mx-auto mb-2" />
                      <p className="font-serif font-bold text-lg text-brand-azul">{e.unidades_disponiveis ?? e.total_unidades}</p>
                      <p className="font-sans text-xs text-brand-texto/60">Unidades</p>
                    </div>
                  )}
                </div>
              </Reveal>

              {/* Progresso */}
              <Reveal delay={0.1} className="mb-12">
                <div className="bg-brand-gelo rounded-xl p-6 border border-brand-borda">
                  <div className="flex justify-between mb-3">
                    <span className="font-sans font-semibold text-brand-azul">Evolução da obra</span>
                    <span className="font-sans font-bold text-brand-dourado">{e.progresso}%</span>
                  </div>
                  <div className="h-3 bg-brand-borda rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-dourado rounded-full transition-all"
                      style={{ width: `${e.progresso}%` }}
                    />
                  </div>
                </div>
              </Reveal>

              {/* Descrição */}
              {e.descricao && (
                <Reveal delay={0.15} className="mb-12">
                  <h2 className="font-serif font-bold text-2xl text-brand-azul mb-4">Sobre o empreendimento</h2>
                  <div className="font-sans text-brand-texto leading-relaxed prose prose-sm max-w-none">
                    {e.descricao}
                  </div>
                </Reveal>
              )}

              {/* Galeria */}
              {fotos.length > 1 && (
                <Reveal delay={0.2}>
                  <h2 className="font-serif font-bold text-2xl text-brand-azul mb-6">Galeria</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {fotos.slice(1).map((foto, i) => (
                      <RevealImage key={i} delay={0.05 * i} className="relative aspect-square rounded-xl overflow-hidden">
                        <Image src={foto} alt={`${e.nome} ${i + 2}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                      </RevealImage>
                    ))}
                  </div>
                </Reveal>
              )}
            </div>

            {/* Sidebar CTA */}
            <div className="lg:col-span-1">
              <Reveal delay={0.2} className="sticky top-28">
                <div className="bg-brand-azul rounded-2xl p-6 text-white">
                  <h3 className="font-serif font-bold text-2xl mb-2 leading-snug">
                    Tenho interesse neste empreendimento
                  </h3>
                  <p className="font-sans text-sm text-white/60 mb-6">
                    Fale com um de nossos especialistas e receba todas as informações.
                  </p>
                  <LeadCTAButton interesse={e.nome} />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
