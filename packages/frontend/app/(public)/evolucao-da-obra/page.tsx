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
  const status = e.progresso >= 100 ? 'Concluído' : e.is_lancamento ? 'Lançamento' : 'Em Obra'
  const statusStyle = e.progresso >= 100 
    ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-400'
    : e.is_lancamento
      ? 'bg-brand-marinho-glow/15 border-brand-marinho-glow/40 text-brand-marinho-glow'
      : 'bg-brand-navy/60 border-white/10 text-white/80'

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-brand-navy/5 shadow-[0_10px_40px_-15px_rgba(10,17,40,0.08)] hover:shadow-[0_20px_60px_-20px_rgba(10,17,40,0.15)] transition-all duration-700">
      <div className="relative aspect-video overflow-hidden">
        {foto ? (
          <Image 
            src={foto} 
            alt={e.nome} 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-[2s] ease-[0.22,1,0.36,1]" 
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy to-brand-marinho" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-transparent to-transparent opacity-40" />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`font-sans text-[8px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full backdrop-blur-md border shadow-lg ${statusStyle}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={10} className="text-brand-marinho-glow shrink-0" />
          <span className="font-sans text-[9px] font-black uppercase tracking-[0.2em] text-brand-navy/40 truncate">
            {e.cidade}{e.estado ? ` · ${e.estado}` : ''}
          </span>
        </div>

        <h3 className="font-serif font-bold text-2xl text-brand-navy mb-6 group-hover:text-brand-marinho transition-colors duration-500">
          {e.nome}
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <span className="font-sans text-[9px] font-black uppercase tracking-[0.2em] text-brand-navy/30">Evolução</span>
            <span className="font-serif text-xl font-bold text-brand-marinho">{e.progresso}%</span>
          </div>
          
          <div className="h-1.5 bg-brand-navy/5 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-brand-marinho to-brand-marinho-glow rounded-full relative z-10 transition-all duration-1000"
              style={{ width: `${e.progresso}%` }}
            />
          </div>
        </div>

        {(e.data_inicio || e.data_entrega) && (
          <div className="mt-8 pt-8 border-t border-brand-navy/5 flex gap-4">
            {e.data_inicio && (
              <div className="flex-1">
                <p className="font-sans text-[8px] font-black uppercase tracking-[0.2em] text-brand-navy/30 mb-1">Início</p>
                <p className="font-serif font-bold text-brand-navy">
                  {new Date(e.data_inicio).getFullYear()}
                </p>
              </div>
            )}
            {e.data_entrega && (
              <div className="flex-1 text-right">
                <p className="font-sans text-[8px] font-black uppercase tracking-[0.2em] text-brand-navy/30 mb-1">Previsão</p>
                <p className="font-serif font-bold text-brand-marinho">
                  {new Date(e.data_entrega).getFullYear()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default async function EvolucaoPage() {
  const empreendimentos = await getEmpreendimentos()

  return (
    <>
      {/* Hero */}
      <section className="bg-brand-navy pt-44 pb-28 relative overflow-hidden">
        {/* Background grid texture */}
        <div className="absolute inset-0 bg-blueprint opacity-[0.03] pointer-events-none" />
        
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-marinho/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <RevealText>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-0.5 w-8 bg-brand-marinho-glow/40" />
              <span className="font-sans text-[10px] font-black uppercase tracking-[0.4em] text-brand-marinho-glow">
                Transparência & Rigor
              </span>
            </div>
          </RevealText>
          <RevealText delay={0.1}>
            <h1 className="font-serif font-bold text-white leading-[1.0] tracking-tight mb-8"
              style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}>
              Evolução da <em className="not-italic text-brand-marinho-glow">obra.</em>
            </h1>
          </RevealText>
          <Reveal delay={0.2}>
            <p className="font-sans text-xl text-white/60 mt-4 max-w-xl leading-relaxed font-light">
              Acompanhe em tempo real o progresso de cada empreendimento.
              Transparência absoluta do solo à entrega das chaves.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Cards */}
      <section className="bg-white py-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Thin separator at top of section if needed */}
          <div className="h-px w-full bg-slate-100 mb-20" />
          {empreendimentos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-8">
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200" />
              </div>
              <p className="font-serif font-bold text-brand-navy/30 text-3xl mb-3">
                Nenhuma obra em acompanhamento
              </p>
              <p className="font-sans text-slate-400 text-sm font-medium tracking-wide">
                Nossos canteiros de obra estão sendo preparados. Volte em breve.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {empreendimentos.map((e, i) => (
                <Reveal key={e.id} delay={0.07 * i}>
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
