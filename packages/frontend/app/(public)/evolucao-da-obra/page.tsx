import { Metadata } from 'next'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { RevealText, Reveal, RevealImage } from '@/components/public/RevealText'
import type { Empreendimento } from '@/types'

export const metadata: Metadata = {
  title: 'Evolução da Obra',
  description: 'Acompanhe a evolução das obras dos empreendimentos da Queiroz Almeida.',
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

function ObraCard({ e }: { e: Empreendimento }) {
  const foto = e.fotos?.[0]
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-brand-borda shadow-sm">
      <div className="relative aspect-video overflow-hidden">
        {foto ? (
          <Image src={foto} alt={e.nome} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-azul to-brand-dark" />
        )}
      </div>
      <div className="p-6">
        <h3 className="font-serif font-bold text-2xl text-brand-azul mb-2">{e.nome}</h3>
        <div className="flex items-center gap-2 text-brand-texto/60 mb-5">
          <MapPin size={14} className="text-brand-dourado" />
          <span className="font-sans text-sm">{e.localizacao}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="font-sans text-sm text-brand-texto">Progresso</span>
          <span className="font-sans font-bold text-brand-dourado text-lg">{e.progresso}%</span>
        </div>
        <div className="h-3 bg-brand-gelo rounded-full overflow-hidden border border-brand-borda">
          <div
            className="h-full bg-brand-dourado rounded-full"
            style={{ width: `${e.progresso}%` }}
          />
        </div>
        <div className="mt-4 flex gap-2">
          <div className="flex-1 bg-brand-gelo rounded-lg p-3 text-center">
            <p className="font-sans text-xs text-brand-texto/60 mb-0.5">Início</p>
            <p className="font-sans font-semibold text-sm text-brand-azul">2024</p>
          </div>
          <div className="flex-1 bg-brand-gelo rounded-lg p-3 text-center">
            <p className="font-sans text-xs text-brand-texto/60 mb-0.5">Previsão</p>
            <p className="font-sans font-semibold text-sm text-brand-azul">2026</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function EvolucaoPage() {
  const empreendimentos = await getEmpreendimentos()

  return (
    <>
      {/* Hero */}
      <section className="bg-brand-azul pt-40 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <RevealText>
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-dourado">
              Transparência
            </span>
          </RevealText>
          <RevealText delay={0.1}>
            <h1 className="font-serif font-bold text-5xl md:text-6xl text-white mt-4 leading-tight">
              Evolução da obra
            </h1>
          </RevealText>
          <Reveal delay={0.2}>
            <p className="font-sans text-lg text-white/60 mt-4 max-w-xl">
              Acompanhe em tempo real o progresso de cada empreendimento.
              Transparência total do início à entrega das chaves.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Cards */}
      <section className="bg-brand-gelo py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {empreendimentos.length === 0 ? (
            <p className="text-center font-sans text-brand-texto/60 py-20">
              Nenhum empreendimento disponível.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {empreendimentos.map((e, i) => (
                <Reveal key={e.id} delay={0.1 * i}>
                  <ObraCard e={e} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
