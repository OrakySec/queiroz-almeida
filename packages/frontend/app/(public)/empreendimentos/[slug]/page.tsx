import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Maximize2, BedDouble, Car, TrendingUp, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Reveal } from '@/components/public/RevealText'
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
    title: `${e.nome} | Queiroz Almeida`,
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
  const label = e.is_lancamento ? 'Lançamento' : 'Em Obra'

  const specs = [
    { icon: Maximize2, label: 'Área', value: e.area_min ? `${e.area_min}${e.area_max && e.area_max !== e.area_min ? `–${e.area_max}` : ''} m²` : null },
    { icon: BedDouble, label: 'Tipologia', value: e.tipologia },
    { icon: Car, label: 'Unidades', value: e.total_unidades?.toString() },
    { icon: TrendingUp, label: 'Progresso', value: e.progresso ? `${e.progresso}%` : null },
  ].filter(s => s.value)

  return (
    <div className="min-h-screen bg-brand-dark">

      {/* ── Cinematic Hero ───────────────────────────────────────── */}
      <section className="relative min-h-[80vh] flex items-end overflow-hidden">
        {fotoPrincipal ? (
          <Image
            src={fotoPrincipal}
            alt={e.nome}
            fill
            className="object-cover brightness-50"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy to-brand-dark" />
        )}

        {/* Multi-layer gradient veil */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/70 via-transparent to-transparent" />

        {/* Blueprint texture */}
        <div className="absolute inset-0 bg-blueprint opacity-[0.03] pointer-events-none" />

        {/* Back link */}
        <Link
          href="/empreendimentos"
          className="absolute top-32 left-6 lg:left-12 z-20 flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-300 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em]">Portfólio</span>
        </Link>

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-20 pt-48 w-full">
          <Reveal>
            <div className="flex items-center gap-4 mb-5">
              <span className={`font-sans text-[8px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full backdrop-blur-md border ${
                e.is_lancamento
                  ? 'bg-brand-marinho-glow/15 border-brand-marinho-glow/40 text-brand-marinho-glow'
                  : 'bg-white/10 border-white/20 text-white'
              }`}>
                {label}
              </span>
              {e.progresso > 0 && (
                <div className="flex items-center gap-2">
                  <TrendingUp size={12} className="text-brand-marinho-glow" />
                  <span className="font-sans text-[10px] font-bold text-brand-marinho-glow uppercase tracking-widest">
                    {e.progresso}% concluído
                  </span>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1
              className="font-serif font-bold text-white leading-[1.0] tracking-tight mb-5"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}
            >
              {e.nome}
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="flex items-center gap-2 text-white/50">
              <MapPin size={14} className="text-brand-marinho-glow shrink-0" />
              <span className="font-sans text-sm">{e.cidade}{e.estado ? `, ${e.estado}` : ''}</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <section className="relative pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">

          {/* ── Specs Strip ── */}
          {specs.length > 0 && (
            <Reveal>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.05] border border-white/[0.05] rounded-2xl overflow-hidden mb-16 -mt-6 relative z-10">
                {specs.map(({ icon: Icon, label, value }, i) => (
                  <div key={i} className="bg-brand-dark px-6 py-6 flex flex-col gap-2">
                    <Icon size={16} className="text-brand-marinho-glow" />
                    <p className="font-serif font-bold text-white text-xl leading-none">{value}</p>
                    <p className="font-sans text-[9px] font-bold uppercase tracking-[0.25em] text-white/30">{label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {/* ── 2-col layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

            {/* Main column */}
            <div className="lg:col-span-2 space-y-16">

              {/* Progress bar */}
              {e.progresso > 0 && (
                <Reveal>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-sans text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Evolução da Obra</span>
                      <span className="font-sans text-[10px] font-black uppercase tracking-[0.25em] text-brand-marinho-glow">{e.progresso}%</span>
                    </div>
                    <div className="h-px w-full bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-marinho to-brand-marinho-glow rounded-full transition-all duration-1000"
                        style={{ width: `${e.progresso}%` }}
                      />
                    </div>
                  </div>
                </Reveal>
              )}

              {/* Separator */}
              <div className="h-px bg-white/[0.06]" />

              {/* Description */}
              {e.descricao && (
                <Reveal delay={0.1}>
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-marinho-glow" />
                      <h2 className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-brand-marinho-glow">
                        Sobre o empreendimento
                      </h2>
                    </div>
                    <p className="font-sans text-white/60 text-base leading-relaxed max-w-2xl">
                      {e.descricao}
                    </p>
                  </div>
                </Reveal>
              )}

              {/* Gallery */}
              {fotos.length > 1 && (
                <Reveal delay={0.15}>
                  <div>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-marinho-glow" />
                      <h2 className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-brand-marinho-glow">
                        Galeria
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {fotos.slice(1).map((foto, i) => (
                        <div
                          key={i}
                          className="relative aspect-square rounded-2xl overflow-hidden border border-white/[0.06] group"
                        >
                          <Image
                            src={foto}
                            alt={`${e.nome} ${i + 2}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-100"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="lg:col-span-1">
              <Reveal delay={0.25}>
                <div className="sticky top-28 space-y-4">
                  {/* CTA Card */}
                  <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8 overflow-hidden relative">
                    {/* Glow */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-brand-marinho-glow/10 blur-[60px] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-5">
                        <CheckCircle2 size={14} className="text-brand-marinho-glow" />
                        <span className="font-sans text-[9px] font-black uppercase tracking-[0.25em] text-brand-marinho-glow">
                          Assessoria Gratuita
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-white text-2xl leading-snug mb-3">
                        Tenho interesse neste empreendimento
                      </h3>
                      <p className="font-sans text-sm text-white/40 mb-8 leading-relaxed">
                        Fale com um de nossos especialistas e receba todas as informações sobre unidades e investimento.
                      </p>
                      <LeadCTAButton interesse={e.nome} />
                    </div>
                  </div>

                  {/* Back to portfolio link */}
                  <Link
                    href="/empreendimentos"
                    className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl border border-white/[0.06] text-white/30 hover:text-white hover:border-white/20 transition-all duration-300 group"
                  >
                    <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em]">Ver portfólio completo</span>
                  </Link>
                </div>
              </Reveal>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
