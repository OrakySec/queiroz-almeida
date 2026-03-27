'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import { EmpreendimentoForm } from '@/components/admin/EmpreendimentoForm'
import { Loader2 } from 'lucide-react'

export default function EditarEmpreendimentoPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/api/admin/empreendimentos/${id}`)
      .then(res => setData(res.data))
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
