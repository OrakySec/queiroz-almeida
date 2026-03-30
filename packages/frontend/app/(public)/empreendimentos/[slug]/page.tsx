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
import { PdfViewer } from '@/components/public/PdfViewer'
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
  if (min == null && max == null) return null
  if (min != null && max != null && min !== max) return `${min}–${max}${suffix}`
  return `${min ?? max}${suffix}`
}

function formatPreco(valor?: number | string | null) {
  const n = Number(valor)
  if (!n) return null
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n)
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
    { icon: Car,       label: 'Vagas',   value: e.vagas_tipo === 'ROTATIVA' ? 'Rotativa' : faixa(e.vagas_min, e.vagas_max) },
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
    (e.vagas_tipo === 'ROTATIVA' || faixa(e.vagas_min, e.vagas_max)) && { label: 'Vagas', value: e.vagas_tipo === 'ROTATIVA' ? 'Rotativa' : faixa(e.vagas_min, e.vagas_max)! },
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
    <div className="min-h-screen bg-white">

      {/* ── Cinematic Hero ───────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-end overflow-hidden">
        {fotoPrincipal ? (
          <Image
            src={fotoPrincipal}
            alt={e.nome}
            fill
            sizes="100vw"
            className="object-cover brightness-[0.45]"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy to-brand-dark" />
        )}

        {/* Multi-layer gradient veil */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-brand-dark/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/60 via-transparent to-transparent" />

        {/* Blueprint texture */}
        <div className="absolute inset-0 bg-blueprint opacity-[0.02] pointer-events-none" />

        {/* Back link */}
        <Link
          href="/empreendimentos"
          className="absolute top-32 left-6 lg:left-12 z-20 flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-sans text-[10px] font-black uppercase tracking-[0.25em]">Portfólio</span>
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
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/80">
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-brand-marinho-glow shrink-0" />
                <span className="font-sans text-sm font-medium tracking-wide">
                  {[e.bairro, e.cidade, e.estado].filter(Boolean).join(' · ')}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden mb-16 -mt-10 relative z-20">
                {specs.map(({ icon: Icon, label, value }, i) => (
                  <div key={i} className="px-5 py-7 flex flex-col items-center text-center gap-2 hover:bg-slate-50 transition-colors border-r border-slate-100 last:border-r-0">
                    <div className="w-10 h-10 rounded-xl bg-brand-navy/5 flex items-center justify-center mb-1">
                      <Icon size={16} className="text-brand-marinho" />
                    </div>
                    <p className="font-serif font-bold text-brand-navy text-xl leading-none">{value}</p>
                    <p className="font-sans text-[9px] font-black uppercase tracking-[0.2em] text-brand-navy/30">{label}</p>
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
                  <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <span className="font-sans text-[10px] font-black uppercase tracking-[0.25em] text-brand-navy/30 mb-1 block">Evolução da Obra</span>
                        <h3 className="font-serif font-bold text-brand-navy text-2xl">Acompanhe a construção</h3>
                      </div>
                      <span className="font-serif font-bold text-brand-marinho text-3xl">{e.progresso}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-brand-marinho rounded-full transition-all duration-1000"
                        style={{ width: `${e.progresso}%` }}
                      />
                    </div>
                    {e.data_entrega && (
                      <p className="font-sans text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                        Previsão de entrega: <span className="text-brand-navy font-black">{formatDate(e.data_entrega)}</span>
                      </p>
                    )}
                  </div>
                </Reveal>
              )}

              {/* Description */}
              {e.descricao && (
                <Reveal delay={0.05}>
                  <div className="py-2">
                    <SectionTitle>Sobre o empreendimento</SectionTitle>
                    <p className="font-sans text-slate-600 text-lg leading-relaxed max-w-2xl font-light whitespace-pre-line">
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
                    <div className="rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                      {ficha.map((row, i) => (
                        <div
                          key={i}
                          className={`flex items-start justify-between gap-4 px-8 py-5 ${
                            i % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                          } ${i < ficha.length - 1 ? 'border-b border-slate-100' : ''}`}
                        >
                          <span className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy/30 shrink-0 pt-0.5 min-w-[140px]">
                            {row.label}
                          </span>
                          <span className="font-sans text-sm font-bold text-brand-navy/70 text-right">
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
                    <div className="flex flex-wrap gap-3">
                      {e.amenidades.map(item => (
                        <span
                          key={item}
                          className="flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-widest text-brand-navy/60 bg-white border border-slate-100 shadow-sm rounded-full px-5 py-3"
                        >
                          <CheckCircle2 size={12} className="text-brand-marinho shrink-0" />
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
                    <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-2">
                        {e.endereco && (
                          <p className="font-serif font-bold text-xl text-brand-navy leading-tight">{e.endereco}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <MapPin size={12} className="text-brand-marinho" />
                          <p className="font-sans text-[11px] text-slate-400 uppercase tracking-widest font-black">
                            {[e.bairro, e.cidade, e.estado].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </div>
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-sans text-[10px] font-black uppercase tracking-[0.2em] text-white bg-brand-navy rounded-full px-7 py-4 hover:bg-brand-marinho transition-all duration-300 shadow-lg shadow-brand-navy/10 shrink-0"
                      >
                        <Navigation size={13} />
                        Mapa Detalhado
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {fotos.slice(1).map((foto, i) => (
                        <div
                          key={i}
                          className="relative aspect-square rounded-3xl overflow-hidden shadow-sm group border border-slate-100"
                        >
                          <Image
                            src={foto}
                            alt={`${e.nome} ${i + 2}`}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                          />
                          <div className="absolute inset-0 bg-brand-navy/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
                  <div className="rounded-[2.5rem] bg-brand-navy p-10 overflow-hidden relative shadow-2xl shadow-brand-navy/20">
                    {/* Glow */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand-marinho-glow/10 blur-[80px] rounded-full pointer-events-none" />
                    <div className="relative z-10">
 
                      {/* Price */}
                      {precoDisplay ? (
                        <div className="mb-8 pb-8 border-b border-white/10">
                          <p className="font-sans text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-2">
                            A partir de
                          </p>
                          <p className="font-serif font-bold text-white leading-none" style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)' }}>
                            {precoMin}
                          </p>
                          {precoMax && precoMax !== precoMin && (
                            <p className="font-sans text-[10px] font-bold text-brand-marinho-glow uppercase tracking-widest mt-2">{precoMax}</p>
                          )}
                        </div>
                      ) : null}
 
                      {/* Quick info */}
                      <div className="space-y-4 mb-10">
                        {faixa(e.quartos_min, e.quartos_max) && (
                          <SidebarInfo icon={BedDouble} label="Quartos" value={faixa(e.quartos_min, e.quartos_max)!} />
                        )}
                        {faixa(e.area_min, e.area_max, ' m²') && (
                          <SidebarInfo icon={Maximize2} label="Área" value={faixa(e.area_min, e.area_max, ' m²')!} />
                        )}
                        {(e.vagas_tipo === 'ROTATIVA' || faixa(e.vagas_min, e.vagas_max)) && (
                          <SidebarInfo icon={Car} label="Vagas" value={e.vagas_tipo === 'ROTATIVA' ? 'Rotativa' : faixa(e.vagas_min, e.vagas_max)!} />
                        )}
                        {e.data_entrega && (
                          <SidebarInfo icon={Calendar} label="Entrega" value={formatDate(e.data_entrega)!} />
                        )}
                      </div>
 
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-marinho-glow animate-pulse" />
                        <span className="font-sans text-[10px] font-black uppercase tracking-[0.25em] text-brand-marinho-glow">
                          Atendimento Personalizado
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-white text-2xl leading-tight mb-4">
                        Interessado neste imóvel?
                      </h3>
                      <p className="font-sans text-xs text-white/50 mb-8 leading-relaxed font-light">
                        Deixe seus dados e um de nossos especialistas entrará em contato para apresentar todas as condições.
                      </p>
                      <LeadCTAButton interesse={e.nome} />
                    </div>
                  </div>

                  {/* Back to portfolio */}
                  <Link
                    href="/empreendimentos"
                    className="flex items-center justify-center gap-3 w-full py-5 rounded-3xl border border-slate-100 text-slate-400 hover:text-brand-navy hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 group"
                  >
                    <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-sans text-[10px] font-black uppercase tracking-[0.25em]">Ver portfólio completo</span>
                  </Link>
                </div>
              </Reveal>
            </div>

          </div>
        </div>
      </section>

      {/* ── Memorial Descritivo ── largura total ─────────────────── */}
      {e.pdf_url && (
        <section className="pb-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-16">
            <Reveal>
              <SectionTitle>Memorial Descritivo</SectionTitle>
              <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-sm bg-white">
                <PdfViewer url={e.pdf_url} />
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </div>
  )
}

/* ── Helpers ─────────────────────────────────────────────────── */

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="h-0.5 w-8 bg-brand-marinho/30" />
      <h2 className="font-serif font-bold text-brand-navy text-2xl tracking-tight">
        {children}
      </h2>
      <div className="h-px flex-1 bg-slate-100" />
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
    <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
          <Icon size={13} className="text-brand-marinho-glow" />
        </div>
        <span className="font-sans text-[10px] font-black uppercase tracking-widest text-white/30 truncate">
          {label}
        </span>
      </div>
      <span className="font-sans text-sm font-bold text-white shrink-0">{value}</span>
    </div>
  )
}
