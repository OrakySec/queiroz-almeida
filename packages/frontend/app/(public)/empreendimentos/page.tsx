import { Metadata } from 'next'
import { EmpreendimentoCard } from '@/components/public/EmpreendimentoCard'
import { Reveal } from '@/components/public/RevealText'
import type { Empreendimento } from '@/types'

export const metadata: Metadata = {
  title: 'Empreendimentos | Queiroz Almeida',
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
    <div className="min-h-screen bg-brand-dark">

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative pt-44 pb-24 overflow-hidden">
        {/* Background grid texture */}
        <div className="absolute inset-0 bg-blueprint opacity-[0.025] pointer-events-none" />
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-brand-marinho-glow/8 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-marinho-glow animate-pulse" />
              <span className="font-sans text-[10px] font-black uppercase tracking-[0.35em] text-brand-marinho-glow">
                Portfólio
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1
              className="font-serif font-bold text-white leading-[1.0] tracking-tight mb-6"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}
            >
              Nossos{' '}
              <em className="not-italic text-brand-marinho-glow">empreendimentos.</em>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="font-sans text-lg text-white/40 max-w-xl leading-relaxed">
              Flats de alto padrão em Porto de Galinhas e Maragogi — onde a valorização imobiliária encontra o litoral.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Grid ────────────────────────────────────────────────── */}
      <section className="relative pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          {/* Thin separator */}
          <div className="h-px w-full bg-white/[0.05] mb-16" />

          {empreendimentos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-6">
                <div className="w-6 h-6 rounded-full border-2 border-dashed border-white/20" />
              </div>
              <p className="font-serif font-bold text-white/20 text-2xl mb-2">
                Nenhum empreendimento disponível
              </p>
              <p className="font-sans text-white/20 text-sm">
                Novos projetos em breve.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {empreendimentos.map((e, i) => (
                <Reveal key={e.id} delay={0.07 * i}>
                  <EmpreendimentoCard empreendimento={e} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
