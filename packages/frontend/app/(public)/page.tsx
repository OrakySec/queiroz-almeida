import { Hero } from '@/components/public/Hero'
import { ConstrucaoScrollVideo } from '@/components/public/ConstrucaoScrollVideo'
import { QuemSomos } from '@/components/public/QuemSomos'
import { Lancamento } from '@/components/public/Lancamento'
import { EmpreendimentosSection } from '@/components/public/EmpreendimentosSection'
import { Depoimentos } from '@/components/public/Depoimentos'
import type { Empreendimento } from '@/types'

async function getEmpreendimentos(): Promise<Empreendimento[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/empreendimentos`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

async function getLancamento(): Promise<Empreendimento | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/empreendimentos/lancamento`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data && typeof data === 'object' && !Array.isArray(data) ? data : null
  } catch {
    return null
  }
}

export default async function HomePage() {
  const [empreendimentos, lancamento] = await Promise.all([
    getEmpreendimentos(),
    getLancamento(),
  ])

  return (
    <>
      <Hero />
      <ConstrucaoScrollVideo />
      <QuemSomos />
      {lancamento && <Lancamento empreendimento={lancamento} />}
      {empreendimentos.length > 0 && (
        <EmpreendimentosSection empreendimentos={empreendimentos} />
      )}
      <Depoimentos />
    </>
  )
}
