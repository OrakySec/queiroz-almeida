'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import { EmpreendimentoForm } from '@/components/admin/EmpreendimentoForm'
import { Loader2 } from 'lucide-react'

/** Converte a resposta snake_case da API para o formato camelCase do formulário */
function apiToForm(d: any) {
  return {
    id: d.id,
    status: d.status,
    fotos: (d.fotos as string[]) ?? [],
    amenidades: (d.amenidades as string[]) ?? [],
    nome: d.nome ?? '',
    slug: d.slug ?? '',
    cidade: d.cidade ?? '',
    estado: d.estado ?? '',
    bairro: d.bairro ?? '',
    endereco: d.endereco ?? '',
    tipoImovel: d.tipo_imovel ?? '',
    padrao: d.padrao ?? '',
    descricaoBreve: d.descricao_breve ?? '',
    descricaoCompleta: d.descricao ?? '',
    tipologia: d.tipologia ?? '',
    quartoMin: d.quartos_min ?? '',
    quartoMax: d.quartos_max ?? '',
    suitesMin: d.suites_min ?? '',
    suitesMax: d.suites_max ?? '',
    banheirosMin: d.banheiros_min ?? '',
    banheirosMax: d.banheiros_max ?? '',
    vagasMin: d.vagas_min ?? '',
    vagasMax: d.vagas_max ?? '',
    vagasTipo: d.vagas_tipo ?? '',
    numTorres: d.num_torres ?? '',
    numAndares: d.num_andares ?? '',
    latitude: d.latitude ?? '',
    longitude: d.longitude ?? '',
    areaMin: d.area_min ?? '',
    areaMax: d.area_max ?? '',
    precoMin: d.preco_min ?? '',
    precoMax: d.preco_max ?? '',
    totalUnidades: d.total_unidades ?? '',
    unidadesDisponiveis: d.unidades_disponiveis ?? '',
    percentualObra: d.progresso ?? 0,
    dataEntrega: d.data_entrega ? String(d.data_entrega).slice(0, 10) : '',
    videoUrl: d.video_url ?? '',
    whatsapp: d.whatsapp ?? '',
    destaque: d.is_lancamento ?? false,
  }
}

export default function EditarEmpreendimentoPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/api/admin/empreendimentos/${id}`)
      .then(res => setData(apiToForm(res.data)))
      .catch(() => setError('Empreendimento não encontrado.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-brand-marinho" />
      </div>
    )
  }

  if (error) {
    return <p className="text-red-500 text-sm">{error}</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Editar Empreendimento</h1>
        <p className="text-sm text-brand-navy/50 mt-1">{data.nome}</p>
      </div>
      <EmpreendimentoForm mode="edit" initialData={data} />
    </div>
  )
}
