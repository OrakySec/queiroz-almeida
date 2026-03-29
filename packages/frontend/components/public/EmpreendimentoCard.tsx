'use client'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, ArrowUpRight, Maximize2, BedDouble, Car } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Empreendimento } from '@/types'

interface Props {
  empreendimento: Empreendimento
}

function formatPreco(valor?: number) {
  if (!valor) return null
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(valor)
}

function faixa(min?: number, max?: number, suffix = '') {
  if (!min && !max) return null
  if (min && max && min !== max) return `${min}–${max}${suffix}`
  return `${min ?? max}${suffix}`
}

export function EmpreendimentoCard({ empreendimento: e }: Props) {
  const foto = e.fotos?.[0]
  const label = e.is_lancamento ? 'Lançamento' : 'Em Obra'

  const localizacao = [e.bairro, e.cidade, e.estado].filter(Boolean).join(', ')
  const quartos = faixa(e.quartos_min, e.quartos_max)
  const vagas = faixa(e.vagas_min, e.vagas_max)
  const area = faixa(e.area_min, e.area_max, ' m²')
  const precoMin = formatPreco(e.preco_min)
  const precoMax = formatPreco(e.preco_max)
  const preco = precoMin
    ? precoMax && precoMax !== precoMin
      ? `${precoMin} – ${precoMax}`
      : precoMin
    : null

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex-shrink-0 w-full bg-brand-dark border border-white/[0.07] rounded-[2rem] overflow-hidden hover:border-brand-marinho-glow/30 transition-all duration-700"
    >
      <Link href={`/empreendimentos/${e.slug}`} className="block">

        {/* ── Image ── */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {foto ? (
            <Image
              src={foto} alt={e.nome} fill
              className="object-cover group-hover:scale-105 transition-transform duration-[1.4s] ease-[0.22,1,0.36,1] brightness-90 group-hover:brightness-100"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-navy to-brand-marinho" />
          )}

          {/* Gradient veil */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/30 to-transparent" />

          {/* Badges — top left */}
          <div className="absolute top-5 left-5 flex items-center gap-2">
            <span className={`font-sans text-[8px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full backdrop-blur-md border shadow-lg ${
              e.is_lancamento
                ? 'bg-brand-marinho-glow/15 border-brand-marinho-glow/40 text-brand-marinho-glow'
                : 'bg-white/10 border-white/20 text-white'
            }`}>
              {label}
            </span>
            {e.tipo_imovel && (
              <span className="font-sans text-[8px] font-black uppercase tracking-[0.25em] px-3 py-2 rounded-full backdrop-blur-md border border-white/10 bg-brand-dark/60 text-white/70">
                {e.tipo_imovel}
              </span>
            )}
          </div>

          {/* Padrão badge — top right */}
          <div className="absolute top-5 right-5 flex items-center gap-2">
            {e.padrao && (
              <span className="font-sans text-[7px] font-black uppercase tracking-[0.25em] px-3 py-1.5 rounded-full backdrop-blur-md border border-brand-marinho-glow/30 bg-brand-marinho-glow/10 text-brand-marinho-glow">
                {e.padrao}
              </span>
            )}
            <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110 group-hover:border-brand-marinho-glow/60">
              <ArrowUpRight size={15} className="text-white" />
            </div>
          </div>

          {/* Progress bar */}
          {e.progresso > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${e.progresso}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                className="h-full bg-gradient-to-r from-brand-marinho to-brand-marinho-glow"
              />
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="p-7 pt-6">

          {/* Location */}
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={10} className="text-brand-marinho-glow shrink-0" />
            <span className="font-sans text-[9px] font-bold uppercase tracking-[0.25em] text-white/60">
              {localizacao}
            </span>
          </div>

          {/* Name */}
          <h3
            className="font-serif font-bold text-white leading-tight tracking-tight mb-2 group-hover:text-brand-marinho-glow transition-colors duration-500"
            style={{ fontSize: 'clamp(1.25rem, 3vw, 1.55rem)' }}
          >
            {e.nome}
          </h3>

          {/* Descrição breve */}
          {e.descricao_breve && (
            <p className="font-sans text-[11px] text-white/40 leading-relaxed mb-5 line-clamp-2">
              {e.descricao_breve}
            </p>
          )}

          {/* Divider */}
          <div className="h-px w-full bg-white/[0.06] mb-5" />

          {/* Specs grid */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {quartos && (
              <div className="flex flex-col gap-1">
                <BedDouble size={12} className="text-brand-marinho-glow" />
                <span className="font-sans text-xs font-bold text-white leading-none">{quartos}</span>
                <span className="font-sans text-[8px] uppercase tracking-widest text-white/35">
                  {Number(e.quartos_max ?? e.quartos_min) > 1 ? 'Quartos' : 'Quarto'}
                </span>
              </div>
            )}
            {vagas && (
              <div className="flex flex-col gap-1">
                <Car size={12} className="text-brand-marinho-glow" />
                <span className="font-sans text-xs font-bold text-white leading-none">{vagas}</span>
                <span className="font-sans text-[8px] uppercase tracking-widest text-white/35">
                  {Number(e.vagas_max ?? e.vagas_min) > 1 ? 'Vagas' : 'Vaga'}
                </span>
              </div>
            )}
            {area && (
              <div className="flex flex-col gap-1">
                <Maximize2 size={12} className="text-brand-marinho-glow" />
                <span className="font-sans text-xs font-bold text-white leading-none">{area}</span>
                <span className="font-sans text-[8px] uppercase tracking-widest text-white/35">Área</span>
              </div>
            )}
          </div>

          {/* Price + progress row */}
          <div className="flex items-end justify-between">
            {preco ? (
              <div>
                <p className="font-sans text-[8px] font-bold uppercase tracking-widest text-white/30 mb-0.5">
                  A partir de
                </p>
                <p className="font-serif font-bold text-white text-base leading-none">
                  {precoMin}
                </p>
              </div>
            ) : (
              <p className="font-sans text-[9px] font-bold uppercase tracking-widest text-white/20">
                Consulte condições
              </p>
            )}

            {e.progresso > 0 && (
              <div className="text-right">
                <span className="font-sans text-[8px] font-bold uppercase tracking-widest text-brand-marinho-glow">
                  {e.progresso}% concluído
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
