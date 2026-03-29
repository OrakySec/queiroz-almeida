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
    <div className="min-h-screen bg-white">

      {/* ── Hero (Banner Azul) ─────────────────────────────────── */}
      <section className="bg-brand-navy pt-44 pb-28 relative overflow-hidden">
        {/* Background grid texture */}
        <div className="absolute inset-0 bg-blueprint opacity-[0.03] pointer-events-none" />
        
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-marinho/10 blur-[120px] rounded-full pointer-events-none" />
 
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <Reveal>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-0.5 w-8 bg-brand-marinho-glow/40" />
              <span className="font-sans text-[10px] font-black uppercase tracking-[0.4em] text-brand-marinho-glow">
                Portfólio Exclusivo
              </span>
            </div>
          </Reveal>
 
          <Reveal delay={0.1}>
            <h1
              className="font-serif font-bold text-white leading-[1.0] tracking-tight mb-8"
              style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}
            >
              Nossos{' '}
              <em className="not-italic text-brand-marinho-glow">empreendimentos.</em>
            </h1>
          </Reveal>
 
          <Reveal delay={0.2}>
            <p className="font-sans text-xl text-white/60 max-w-xl leading-relaxed font-light">
              Flats de alto padrão em Porto de Galinhas e Maragogi — onde a valorização imobiliária encontra o paraíso.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Grid ────────────────────────────────────────────────── */}
      <section className="relative pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
 
          {/* Thin separator */}
          <div className="h-px w-full bg-slate-100 mb-20" />

          {empreendimentos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-8">
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200" />
              </div>
              <p className="font-serif font-bold text-brand-navy/30 text-3xl mb-3">
                Nenhum empreendimento disponível
              </p>
              <p className="font-sans text-slate-400 text-sm font-medium tracking-wide">
                Nossos arquitetos estão desenhando o seu futuro. Volte em breve.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
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
