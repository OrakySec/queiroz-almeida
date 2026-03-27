import { Metadata } from 'next'
import { EmpreendimentoCard } from '@/components/public/EmpreendimentoCard'
import { RevealText, Reveal } from '@/components/public/RevealText'
import type { Empreendimento } from '@/types'

export const metadata: Metadata = {
  title: 'Empreendimentos',
  description: 'Conheça os empreendimentos da Queiroz Almeida em Porto de Galinhas e Maragogi.',
}

async function getEmpreendimentos(): Promise<Empreendimento[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/empreendimentos`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function EmpreendimentosPage() {
  const empreendimentos = await getEmpreendimentos()

  return (
    <>
      {/* Hero da página */}
      <section className="bg-brand-azul pt-40 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <RevealText>
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-dourado">
              Portfólio
            </span>
          </RevealText>
          <RevealText delay={0.1}>
            <h1 className="font-serif font-bold text-5xl md:text-6xl text-white mt-4 leading-tight">
              Nossos empreendimentos
            </h1>
          </RevealText>
          <Reveal delay={0.2}>
            <p className="font-sans text-lg text-white/60 mt-4 max-w-xl">
              Flats de investimento no litoral nordestino com alto padrão construtivo e localização privilegiada.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Grid */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {empreendimentos.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-sans text-brand-texto/60 text-lg">
                Nenhum empreendimento disponível no momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {empreendimentos.map((e, i) => (
                <Reveal key={e.id} delay={0.05 * i}>
                  {/* Adaptar card para grid (não horizontal scroll) */}
                  <div className="w-full">
                    <EmpreendimentoCard empreendimento={e} />
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
