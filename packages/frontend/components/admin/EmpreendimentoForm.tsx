'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import api from '@/lib/api'
import { FotoUploader } from './FotoUploader'
import { Save, Loader2, Send, RotateCcw } from 'lucide-react'
import { useAdmin } from '@/context/AdminContext'

const schema = z.object({
  nome: z.string().min(3, 'Nome obrigatório'),
  slug: z.string().min(3, 'Slug obrigatório').regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens'),
  cidade: z.string().min(2, 'Cidade obrigatória'),
  estado: z.string().length(2, 'UF com 2 letras'),
  descricaoBreve: z.string().min(10, 'Descrição breve obrigatória'),
  descricaoCompleta: z.string().optional(),
  tipologia: z.string().optional(),
  areaMin: z.coerce.number().positive().optional().or(z.literal('')),
  areaMax: z.coerce.number().positive().optional().or(z.literal('')),
  precoMin: z.coerce.number().positive().optional().or(z.literal('')),
  precoMax: z.coerce.number().positive().optional().or(z.literal('')),
  totalUnidades: z.coerce.number().int().positive().optional().or(z.literal('')),
  unidadesDisponiveis: z.coerce.number().int().min(0).optional().or(z.literal('')),
  percentualObra: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  dataEntrega: z.string().optional(),
  destaque: z.boolean().optional(),
  videoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  whatsapp: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  initialData?: FormData & { id?: string; status?: string; fotos?: { id: string; url: string; ordem: number; legenda: string | null }[] }
  mode: 'create' | 'edit'
}

export function EmpreendimentoForm({ initialData, mode }: Props) {
  const router = useRouter()
  const { user } = useAdmin()
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [empId, setEmpId] = useState<string | undefined>(initialData?.id)

  const [fotos, setFotos] = useState<string[]>(
    initialData?.fotos?.map((f) => f.url) ?? []
  )

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData ?? { destaque: false },
  })

  const nomeValue = watch('nome')

  // Auto-generate slug on create
  useEffect(() => {
    if (mode === 'create' && nomeValue) {
      const slug = nomeValue
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
      setValue('slug', slug)
    }
  }, [nomeValue, mode, setValue])

  async function onSave(data: FormData) {
    setSaving(true)
    try {
      const payload = { ...data, status: 'RASCUNHO' }
      if (mode === 'create') {
        const res = await api.post('/api/admin/empreendimentos', payload)
        setEmpId(res.data.id)
      } else {
        await api.put(`/api/admin/empreendimentos/${empId}`, payload)
      }
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function onSubmitForApproval(data: FormData) {
    setSubmitting(true)
    try {
      let id = empId
      if (mode === 'create' || !id) {
        const res = await api.post('/api/admin/empreendimentos', data)
        id = res.data.id
        setEmpId(id)
      } else {
        await api.put(`/api/admin/empreendimentos/${id}`, data)
      }
      await api.patch(`/api/admin/empreendimentos/${id}/status`, { status: 'AGUARDANDO_APROVACAO' })
      router.push('/admin/empreendimentos')
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erro ao enviar para aprovação')
    } finally {
      setSubmitting(false)
    }
  }

  const canApprove = user?.role === 'ADMIN' || user?.role === 'GERENTE'

  return (
    <div className="space-y-8">
      <form className="space-y-8">
        {/* Dados Principais */}
        <section className="bg-white rounded-2xl border border-brand-navy/5 shadow-sm p-6 lg:p-8">
          <h2 className="font-semibold text-brand-navy mb-6 text-lg">Dados Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Nome do Empreendimento" error={errors.nome?.message}>
              <input {...register('nome')} className={input()} placeholder="Porto Lagoa Residence" />
            </Field>
            <Field label="Slug (URL)" error={errors.slug?.message}>
              <input {...register('slug')} className={input()} placeholder="porto-lagoa-residence" />
            </Field>
            <Field label="Cidade" error={errors.cidade?.message}>
              <input {...register('cidade')} className={input()} placeholder="Porto de Galinhas" />
            </Field>
            <Field label="Estado (UF)" error={errors.estado?.message}>
              <input {...register('estado')} className={input()} placeholder="PE" maxLength={2} />
            </Field>
            <Field label="Descrição Breve" error={errors.descricaoBreve?.message} className="md:col-span-2">
              <textarea {...register('descricaoBreve')} className={input('h-20 resize-none')} placeholder="Resumo em 1-2 frases para o card" />
            </Field>
            <Field label="Descrição Completa (Markdown)" error={errors.descricaoCompleta?.message} className="md:col-span-2">
              <textarea {...register('descricaoCompleta')} className={input('h-40 resize-y font-mono text-sm')} placeholder="Descrição detalhada do empreendimento..." />
            </Field>
            <Field label="Tipologia" error={errors.tipologia?.message}>
              <input {...register('tipologia')} className={input()} placeholder="Flat 1 suíte / Flat 2 suítes" />
            </Field>
            <Field label="WhatsApp (com DDI)" error={errors.whatsapp?.message}>
              <input {...register('whatsapp')} className={input()} placeholder="+5581999999999" />
            </Field>
          </div>
        </section>

        {/* Ficha Técnica */}
        <section className="bg-white rounded-2xl border border-brand-navy/5 shadow-sm p-6 lg:p-8">
          <h2 className="font-semibold text-brand-navy mb-6 text-lg">Ficha Técnica</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            <Field label="Área Mín. (m²)" error={errors.areaMin?.message}>
              <input {...register('areaMin')} type="number" className={input()} placeholder="35" />
            </Field>
            <Field label="Área Máx. (m²)" error={errors.areaMax?.message}>
              <input {...register('areaMax')} type="number" className={input()} placeholder="70" />
            </Field>
            <Field label="Preço Mín. (R$)" error={errors.precoMin?.message}>
              <input {...register('precoMin')} type="number" className={input()} placeholder="280000" />
            </Field>
            <Field label="Preço Máx. (R$)" error={errors.precoMax?.message}>
              <input {...register('precoMax')} type="number" className={input()} placeholder="650000" />
            </Field>
            <Field label="Total de Unidades" error={errors.totalUnidades?.message}>
              <input {...register('totalUnidades')} type="number" className={input()} placeholder="120" />
            </Field>
            <Field label="Unidades Disponíveis" error={errors.unidadesDisponiveis?.message}>
              <input {...register('unidadesDisponiveis')} type="number" className={input()} placeholder="48" />
            </Field>
            <Field label="Evolução da Obra (%)" error={errors.percentualObra?.message}>
              <input {...register('percentualObra')} type="number" min={0} max={100} className={input()} placeholder="65" />
            </Field>
            <Field label="Data de Entrega" error={errors.dataEntrega?.message}>
              <input {...register('dataEntrega')} type="date" className={input()} />
            </Field>
            <Field label="URL do Vídeo" error={errors.videoUrl?.message}>
              <input {...register('videoUrl')} className={input()} placeholder="https://..." />
            </Field>
          </div>

          <div className="mt-5">
            <label className="flex items-center gap-3 cursor-pointer w-fit">
              <input
                type="checkbox"
                {...register('destaque')}
                className="w-4 h-4 rounded border-brand-navy/20 text-brand-marinho focus:ring-brand-marinho"
              />
              <span className="text-sm font-medium text-brand-navy">Marcar como Destaque (aparece em primeiro na listagem)</span>
            </label>
          </div>
        </section>

        {/* Fotos */}
        {empId && (
          <section className="bg-white rounded-2xl border border-brand-navy/5 shadow-sm p-6 lg:p-8">
            <h2 className="font-semibold text-brand-navy mb-6 text-lg">Fotos</h2>
            <FotoUploader empreendimentoId={empId} fotos={fotos} onChange={setFotos} />
          </section>
        )}

        {!empId && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            Salve o empreendimento primeiro para habilitar o upload de fotos.
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSubmit(onSave)}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-brand-navy/5 text-brand-navy font-semibold text-sm hover:bg-brand-navy/10 transition disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Salvar Rascunho
          </button>

          {canApprove ? (
            <button
              type="button"
              onClick={handleSubmit(async (data) => {
                setSubmitting(true)
                try {
                  let id = empId
                  if (mode === 'create' || !id) {
                    const res = await api.post('/api/admin/empreendimentos', data)
                    id = res.data.id
                    setEmpId(id)
                  } else {
                    await api.put(`/api/admin/empreendimentos/${id}`, data)
                  }
                  await api.patch(`/api/admin/empreendimentos/${id}/status`, { status: 'PUBLICADO' })
                  router.push('/admin/empreendimentos')
                } catch (err: any) {
                  alert(err?.response?.data?.message ?? 'Erro')
                } finally {
                  setSubmitting(false)
                }
              })}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Publicar Agora
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit(onSubmitForApproval)}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-brand-marinho text-white font-semibold text-sm hover:bg-brand-marinho/90 transition disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Enviar para Aprovação
            </button>
          )}

          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-brand-navy/10 text-brand-navy/60 font-semibold text-sm hover:text-brand-navy transition"
          >
            <RotateCcw size={16} />
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label, error, children, className,
}: {
  label: string; error?: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy/50 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function input(extra = '') {
  return `w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 bg-brand-navy/[0.02] text-brand-navy placeholder-brand-navy/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-marinho/30 focus:border-brand-marinho transition ${extra}`
}
