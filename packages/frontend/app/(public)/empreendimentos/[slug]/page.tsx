import type { ReactNode } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  MapPin, Maximize2, BedDouble, Car, TrendingUp, ArrowLeft, CheckCircle2,
  Bath, Building2, Calendar, Navigation, Hash, type LucideIcon,
} from 'lucide-react'
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

function faixa(min?: number, max?: number, suffix = '') {
  if (!min && !max) return null
  if (min && max && min !== max) return `${min}–${max}${suffix}`
  return `${min ?? max}${suffix}`
}

function formatPreco(valor?: number) {
  if (!valor) return null
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(valor)
}

function formatDate(iso?: string) {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
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

  const precoMin = formatPreco(e.preco_min)
  const precoMax = formatPreco(e.preco_max)
  const precoDisplay = precoMin
    ? precoMax && precoMax !== precoMin
      ? `${precoMin} – ${precoMax}`
      : precoMin
    : null

  // Top specs strip (highlight numbers)
  const specs = [
    { icon: Maximize2, label: 'Área', value: faixa(e.area_min, e.area_max, ' m²') },
    { icon: BedDouble, label: 'Quartos', value: faixa(e.quartos_min, e.quartos_max) },
    { icon: Bath,      label: 'Suítes',  value: faixa(e.suites_min, e.suites_max) },
    { icon: Car,       label: 'Vagas',   value: faixa(e.vagas_min, e.vagas_max) },
    { icon: Building2, label: 'Unidades', value: e.total_unidades?.toString() ?? null },
    { icon: TrendingUp, label: 'Progresso', value: e.progresso > 0 ? `${e.progresso}%` : null },
  ].filter(s => s.value)

  // Ficha técnica rows (label → value pairs)
  const ficha: { label: string; value: string }[] = [
    e.tipo_imovel            && { label: 'Tipo',             value: e.tipo_imovel },
    e.padrao                 && { label: 'Padrão',           value: e.padrao },
    e.tipologia              && { label: 'Tipologia',        value: e.tipologia },
    faixa(e.quartos_min, e.quartos_max) && { label: 'Quartos', value: faixa(e.quartos_min, e.quartos_max)! },
    faixa(e.suites_min, e.suites_max)   && { label: 'Suítes',  value: faixa(e.suites_min, e.suites_max)! },
    faixa(e.banheiros_min, e.banheiros_max) && { label: 'Banheiros', value: faixa(e.banheiros_min, e.banheiros_max)! },
    faixa(e.vagas_min, e.vagas_max)     && { label: 'Vagas',   value: faixa(e.vagas_min, e.vagas_max)! },
    faixa(e.area_min, e.area_max, ' m²') && { label: 'Área privativa', value: faixa(e.area_min, e.area_max, ' m²')! },
    e.num_torres             && { label: 'Torres',           value: String(e.num_torres) },
    e.num_andares            && { label: 'Andares',          value: String(e.num_andares) },
    e.total_unidades         && { label: 'Total de unidades', value: String(e.total_unidades) },
    e.unidades_disponiveis != null && e.unidades_disponiveis !== undefined
      ? { label: 'Unidades disponíveis', value: String(e.unidades_disponiveis) } : null,
    formatDate(e.data_entrega) && { label: 'Previsão de entrega', value: formatDate(e.data_entrega)! },
    e.cidade                 && { label: 'Cidade',           value: [e.cidade, e.estado].filter(Boolean).join(' – ') },
    e.bairro                 && { label: 'Bairro',           value: e.bairro },
    e.endereco               && { label: 'Endereço',         value: e.endereco },
  ].filter(Boolean) as { label: string; value: string }[]

  // Google Maps link (lat/lng preferred, else search by address)
  const mapUrl = e.latitude && e.longitude
    ? `https://www.google.com/maps?q=${e.latitude},${e.longitude}`
    : e.endereco
      ? `https://www.google.com/maps/search/${encodeURIComponent([e.endereco, e.bairro, e.cidade, e.estado].filter(Boolean).join(', '))}`
      : null

  return (
    <div className="min-h-screen bg-brand-dark">

      {/* ── Cinematic Hero ───────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-end overflow-hidden">
        {fotoPrincipal ? (
          <Image
            src={fotoPrincipal}
            alt={e.nome}
            fill
            className="object-cover brightness-[0.45]"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy to-brand-dark" />
        )}

        {/* Multi-layer gradient veil */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/75 via-transparent to-transparent" />

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
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-24 pt-48 w-full">

          <Reveal>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {/* Status badge */}
              <span className={`font-sans text-[8px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full backdrop-blur-md border ${
                e.is_lancamento
                  ? 'bg-brand-marinho-glow/15 border-brand-marinho-glow/40 text-brand-marinho-glow'
                  : 'bg-white/10 border-white/20 text-white'
              }`}>
                {label}
              </span>

              {/* Tipo imovel badge */}
              {e.tipo_imovel && (
                <span className="font-sans text-[8px] font-black uppercase tracking-[0.25em] px-3 py-2 rounded-full backdrop-blur-md border border-white/10 bg-brand-dark/50 text-white/70">
                  {e.tipo_imovel}
                </span>
              )}

              {/* Padrão badge */}
              {e.padrao && (
                <span className="font-sans text-[8px] font-black uppercase tracking-[0.25em] px-3 py-2 rounded-full backdrop-blur-md border border-brand-marinho-glow/30 bg-brand-marinho-glow/10 text-brand-marinho-glow">
                  {e.padrao}
                </span>
              )}

              {/* Progresso */}
              {e.progresso > 0 && (
                <div className="flex items-center gap-2">
                  <TrendingUp size={11} className="text-brand-marinho-glow" />
                  <span className="font-sans text-[10px] font-bold text-brand-marinho-glow uppercase tracking-widest">
                    {e.progresso}% concluído
                  </span>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1
              className="font-serif font-bold text-white leading-[1.0] tracking-tight mb-4"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}
            >
              {e.nome}
            </h1>
          </Reveal>

          {e.tipologia && (
            <Reveal delay={0.15}>
              <p className="font-sans text-brand-marinho-glow/80 text-sm font-semibold mb-3">
                {e.tipologia}
              </p>
            </Reveal>
          )}

          <Reveal delay={0.2}>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-white/50">
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-brand-marinho-glow shrink-0" />
                <span className="font-sans text-sm">
                  {[e.bairro, e.cidade, e.estado].filter(Boolean).join(', ')}
                </span>
              </div>
              {precoDisplay && (
                <div className="flex items-center gap-1.5 text-white/80">
                  <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-white/35">a partir de</span>
                  <span className="font-serif font-bold text-white text-lg leading-none">{precoMin}</span>
                </div>
              )}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-px bg-white/[0.05] border border-white/[0.05] rounded-2xl overflow-hidden mb-16 -mt-6 relative z-10">
                {specs.map(({ icon: Icon, label, value }, i) => (
                  <div key={i} className="bg-brand-dark px-5 py-6 flex flex-col gap-2">
                    <Icon size={15} className="text-brand-marinho-glow" />
                    <p className="font-serif font-bold text-white text-xl leading-none">{value}</p>
                    <p className="font-sans text-[9px] font-bold uppercase tracking-[0.25em] text-white/30">{label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {/* ── 2-col layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

            {/* ── Main column ── */}
            <div className="lg:col-span-2 space-y-14">

              {/* Progress bar */}
              {e.progresso > 0 && (
                <Reveal>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-sans text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Evolução da Obra</span>
                      <span className="font-sans text-[10px] font-black uppercase tracking-[0.25em] text-brand-marinho-glow">{e.progresso}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/[0.07] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-marinho to-brand-marinho-glow rounded-full transition-all duration-1000"
                        style={{ width: `${e.progresso}%` }}
                      />
                    </div>
                    {e.data_entrega && (
                      <p className="font-sans text-[10px] text-white/30 mt-2">
                        Previsão de entrega: <span className="text-white/50 font-semibold">{formatDate(e.data_entrega)}</span>
                      </p>
                    )}
                  </div>
                </Reveal>
              )}

              {/* Description */}
              {e.descricao && (
                <Reveal delay={0.05}>
                  <div>
                    <SectionTitle>Sobre o empreendimento</SectionTitle>
                    <p className="font-sans text-white/60 text-base leading-relaxed max-w-2xl">
                      {e.descricao}
                    </p>
                  </div>
                </Reveal>
              )}

              {/* ── Ficha Técnica ── */}
              {ficha.length > 0 && (
                <Reveal delay={0.08}>
                  <div>
                    <SectionTitle>Ficha Técnica</SectionTitle>
                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
                      {ficha.map((row, i) => (
                        <div
                          key={i}
                          className={`flex items-start justify-between gap-4 px-6 py-4 ${
                            i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'
                          } ${i < ficha.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
                        >
                          <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-white/30 shrink-0 pt-0.5 min-w-[120px]">
                            {row.label}
                          </span>
                          <span className="font-sans text-sm font-semibold text-white/80 text-right">
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}

              {/* Amenidades */}
              {e.amenidades && e.amenidades.length > 0 && (
                <Reveal delay={0.1}>
                  <div>
                    <SectionTitle>Amenidades & Diferenciais</SectionTitle>
                    <div className="flex flex-wrap gap-2">
                      {e.amenidades.map(item => (
                        <span
                          key={item}
                          className="flex items-center gap-1.5 font-sans text-[11px] font-semibold text-white/70 bg-white/[0.05] border border-white/[0.08] rounded-full px-4 py-2"
                        >
                          <CheckCircle2 size={11} className="text-brand-marinho-glow shrink-0" />
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}

              {/* Localização / Map link */}
              {mapUrl && (
                <Reveal delay={0.12}>
                  <div>
                    <SectionTitle>Localização</SectionTitle>
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        {e.endereco && (
                          <p className="font-sans text-sm text-white/70 font-semibold">{e.endereco}</p>
                        )}
                        <p className="font-sans text-[11px] text-white/35 uppercase tracking-widest font-bold">
                          {[e.bairro, e.cidade, e.estado].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-brand-marinho-glow border border-brand-marinho-glow/30 rounded-full px-5 py-2.5 hover:bg-brand-marinho-glow/10 transition-colors duration-300 shrink-0"
                      >
                        <Navigation size={12} />
                        Ver no mapa
                      </a>
                    </div>
                  </div>
                </Reveal>
              )}

              {/* Gallery */}
              {fotos.length > 1 && (
                <Reveal delay={0.15}>
                  <div>
                    <SectionTitle>Galeria</SectionTitle>
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

                  {/* Price + CTA Card */}
                  <div className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8 overflow-hidden relative">
                    {/* Glow */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-brand-marinho-glow/10 blur-[60px] rounded-full pointer-events-none" />
                    <div className="relative z-10">

                      {/* Price */}
                      {precoDisplay ? (
                        <div className="mb-6 pb-6 border-b border-white/[0.07]">
                          <p className="font-sans text-[9px] font-black uppercase tracking-[0.25em] text-white/30 mb-1">
                            A partir de
                          </p>
                          <p className="font-serif font-bold text-white leading-none" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                            {precoMin}
                          </p>
                          {precoMax && precoMax !== precoMin && (
                            <p className="font-sans text-xs text-white/35 mt-1">até {precoMax}</p>
                          )}
                        </div>
                      ) : null}

                      {/* Quick info */}
                      <div className="space-y-3 mb-6">
                        {faixa(e.quartos_min, e.quartos_max) && (
                          <SidebarInfo icon={BedDouble} label="Quartos" value={faixa(e.quartos_min, e.quartos_max)!} />
                        )}
                        {faixa(e.area_min, e.area_max, ' m²') && (
                          <SidebarInfo icon={Maximize2} label="Área" value={faixa(e.area_min, e.area_max, ' m²')!} />
                        )}
                        {faixa(e.vagas_min, e.vagas_max) && (
                          <SidebarInfo icon={Car} label="Vagas" value={faixa(e.vagas_min, e.vagas_max)!} />
                        )}
                        {e.data_entrega && (
                          <SidebarInfo icon={Calendar} label="Entrega" value={formatDate(e.data_entrega)!} />
                        )}
                        {e.unidades_disponiveis != null && (
                          <SidebarInfo icon={Hash} label="Unidades disponíveis" value={String(e.unidades_disponiveis)} />
                        )}
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-white/[0.07] mb-6" />

                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 size={14} className="text-brand-marinho-glow" />
                        <span className="font-sans text-[9px] font-black uppercase tracking-[0.25em] text-brand-marinho-glow">
                          Assessoria Gratuita
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-white text-xl leading-snug mb-3">
                        Tenho interesse neste empreendimento
                      </h3>
                      <p className="font-sans text-xs text-white/40 mb-6 leading-relaxed">
                        Fale com um especialista e receba todas as informações sobre unidades e formas de pagamento.
                      </p>
                      <LeadCTAButton interesse={e.nome} />
                    </div>
                  </div>

                  {/* Back to portfolio */}
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

/* ── Helpers ─────────────────────────────────────────────────── */

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1.5 h-1.5 rounded-full bg-brand-marinho-glow shrink-0" />
      <h2 className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-brand-marinho-glow">
        {children}
      </h2>
    </div>
  )
}

function SidebarInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <Icon size={12} className="text-brand-marinho-glow shrink-0" />
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-white/30 truncate">
          {label}
        </span>
      </div>
      <span className="font-sans text-xs font-bold text-white/70 shrink-0">{value}</span>
    </div>
  )
}
