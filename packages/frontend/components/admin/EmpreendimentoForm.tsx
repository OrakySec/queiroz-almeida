'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDropzone } from 'react-dropzone'
import api from '@/lib/api'
import { FotoUploader } from './FotoUploader'
import { Save, Loader2, Send, RotateCcw, Upload, X, ImageIcon } from 'lucide-react'
import { useAdmin } from '@/context/AdminContext'

const emptyToUndef = (v: unknown) => (v === '' || v == null ? undefined : v)
const optNum = z.preprocess(emptyToUndef, z.coerce.number().positive().optional())
const optInt = z.preprocess(emptyToUndef, z.coerce.number().int().min(0).optional())

const schema = z.object({
  nome: z.string().min(3, 'Nome obrigatório'),
  slug: z.string().min(3, 'Slug obrigatório').regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens'),
  cidade: z.string().min(2, 'Cidade obrigatória'),
  estado: z.string().length(2, 'UF com 2 letras'),
  bairro: z.string().optional(),
  endereco: z.string().optional(),
  tipoImovel: z.string().optional(),
  padrao: z.string().optional(),
  descricaoBreve: z.string().min(10, 'Descrição breve obrigatória'),
  descricaoCompleta: z.string().optional(),
  tipologia: z.string().optional(),
  quartoMin: optInt,
  quartoMax: optInt,
  suitesMin: optInt,
  suitesMax: optInt,
  banheirosMin: optInt,
  banheirosMax: optInt,
  numTorres: optInt,
  numAndares: optInt,
  latitude: z.preprocess(emptyToUndef, z.coerce.number().optional()),
  longitude: z.preprocess(emptyToUndef, z.coerce.number().optional()),
  amenidades: z.array(z.string()).optional(),
  areaMin: optNum,
  areaMax: optNum,
  precoMin: optNum,
  precoMax: optNum,
  totalUnidades: z.preprocess(emptyToUndef, z.coerce.number().int().positive().optional()),
  unidadesDisponiveis: z.preprocess(emptyToUndef, z.coerce.number().int().min(0).optional()),
  percentualObra: z.preprocess(emptyToUndef, z.coerce.number().min(0).max(100).optional()),
  dataEntrega: z.string().optional(),
  destaque: z.boolean().optional(),
  videoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  whatsapp: z.string().optional(),
})

const AMENIDADES_LISTA = [
  'Piscina', 'Academia / Fitness', 'Salão de Festas', 'Churrasqueira',
  'Playground', 'Bicicletário', 'Coworking', 'Espaço Gourmet',
  'Sauna', 'Quadra Poliesportiva', 'Quadra de Tênis', 'Campo de Futebol',
  'Espaço Kids', 'Pet Place', 'Lavanderia', 'Rooftop',
  'Cinema', 'Espaço Zen', 'Portaria 24h', 'Gerador',
  'Elevador', 'Câmeras de Segurança', 'Estacionamento de Visitantes',
]

type FormData = z.infer<typeof schema>

interface Props {
  initialData?: FormData & { id?: string; status?: string; fotos?: string[] }
  mode: 'create' | 'edit'
}

export function EmpreendimentoForm({ initialData, mode }: Props) {
  const router = useRouter()
  const { user } = useAdmin()
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [empId, setEmpId] = useState<string | undefined>(initialData?.id)

  // Fotos já confirmadas (URLs no servidor)
  const [fotos, setFotos] = useState<string[]>(initialData?.fotos ?? [])

  // Amenidades (checkboxes)
  const [amenidades, setAmenidades] = useState<string[]>(
    (initialData as any)?.amenidades ?? []
  )
  function toggleAmenidade(item: string) {
    setAmenidades(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    )
  }

  // Vagas (selects independentes do RHF)
  const initVagasTipo = (initialData as any)?.vagasTipo ?? ''
  const [vagasTipo, setVagasTipo] = useState<string>(initVagasTipo)
  const [vagasMin, setVagasMin] = useState<string>(
    initVagasTipo === 'ROTATIVA' ? 'ROTATIVA'
      : (initialData as any)?.vagasMin != null && (initialData as any)?.vagasMin !== ''
        ? String((initialData as any).vagasMin) : ''
  )
  const [vagasMax, setVagasMax] = useState<string>(
    (initialData as any)?.vagasMax != null && (initialData as any)?.vagasMax !== ''
      ? String((initialData as any).vagasMax) : ''
  )

  function handleVagasMinChange(val: string) {
    if (val === 'ROTATIVA') {
      setVagasTipo('ROTATIVA')
      setVagasMin('ROTATIVA')
      setVagasMax('')
    } else {
      setVagasTipo('')
      setVagasMin(val)
    }
  }

  // Arquivos pendentes para enviar junto com a criação
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([])
  // Guarda as URLs de objeto para liberar memória ao desmontar
  const previewUrlsRef = useRef<string[]>([])

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  const onDropPending = useCallback((files: File[]) => {
    const urls = files.map(f => URL.createObjectURL(f))
    previewUrlsRef.current.push(...urls)
    setPendingFiles(prev => [...prev, ...files])
    setPendingPreviews(prev => [...prev, ...urls])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropPending,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 10 * 1024 * 1024,
    disabled: saving || submitting,
  })

  function removePending(index: number) {
    URL.revokeObjectURL(pendingPreviews[index])
    setPendingFiles(prev => prev.filter((_, i) => i !== index))
    setPendingPreviews(prev => prev.filter((_, i) => i !== index))
  }

  /** Envia os arquivos pendentes para um ID já existente */
  async function uploadPendingFiles(id: string) {
    if (pendingFiles.length === 0) return
    const form = new FormData()
    pendingFiles.forEach(f => form.append('files', f))
    try {
      const res = await api.post(
        `/api/admin/empreendimentos/${id}/fotos`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      setFotos(res.data.fotos ?? [])
      setPendingFiles([])
      setPendingPreviews([])
    } catch {
      // não bloqueia — empreendimento foi criado, fotos podem ser enviadas depois
    }
  }

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

  function withAmenidades(data: FormData) {
    return {
      ...data,
      amenidades,
      vagasMin: vagasTipo === 'ROTATIVA' ? '' : vagasMin,
      vagasMax: vagasTipo === 'ROTATIVA' ? '' : vagasMax,
      vagasTipo: vagasTipo || undefined,
    }
  }

  async function onSave(data: FormData) {
    setSaving(true)
    try {
      const payload = withAmenidades(data)
      if (mode === 'create') {
        const res = await api.post('/api/admin/empreendimentos', { ...payload, status: 'RASCUNHO' })
        const newId: string = res.data.id
        setEmpId(newId)
        await uploadPendingFiles(newId)
      } else {
        await api.put(`/api/admin/empreendimentos/${empId}`, payload)
      }
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function publishWith(data: FormData, targetStatus: 'PUBLICADO' | 'AGUARDANDO_APROVACAO') {
    setSubmitting(true)
    try {
      const payload = withAmenidades(data)
      let id = empId
      if (mode === 'create' || !id) {
        const res = await api.post('/api/admin/empreendimentos', payload)
        id = res.data.id
        setEmpId(id)
      } else {
        await api.put(`/api/admin/empreendimentos/${id}`, payload)
      }
      await uploadPendingFiles(id!)
      await api.patch(`/api/admin/empreendimentos/${id}/status`, { status: targetStatus })
      router.push('/admin/empreendimentos')
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erro ao publicar')
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
            <Field label="Bairro" error={errors.bairro?.message}>
              <input {...register('bairro')} className={input()} placeholder="Meireles" />
            </Field>
            <Field label="Endereço / Logradouro" error={errors.endereco?.message} className="md:col-span-2">
              <input {...register('endereco')} className={input()} placeholder="Av. Beira Mar, 1234" />
            </Field>
            <Field label="Tipo do Imóvel" error={errors.tipoImovel?.message}>
              <select {...register('tipoImovel')} className={input()}>
                <option value="">Selecione...</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Flat">Flat</option>
                <option value="Studio">Studio</option>
                <option value="Cobertura">Cobertura</option>
                <option value="Casa">Casa</option>
                <option value="Casa em Condomínio">Casa em Condomínio</option>
                <option value="Loft">Loft</option>
              </select>
            </Field>
            <Field label="Padrão" error={errors.padrao?.message}>
              <select {...register('padrao')} className={input()}>
                <option value="">Selecione...</option>
                <option value="Econômico">Econômico</option>
                <option value="Médio">Médio</option>
                <option value="Alto">Alto</option>
                <option value="Luxo">Luxo</option>
              </select>
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mt-5">
            <Field label="Quartos (mín)" error={errors.quartoMin?.message}>
              <input {...register('quartoMin')} type="number" min={0} className={input()} placeholder="1" />
            </Field>
            <Field label="Quartos (máx)" error={errors.quartoMax?.message}>
              <input {...register('quartoMax')} type="number" min={0} className={input()} placeholder="4" />
            </Field>
            <Field label="Suítes (mín)" error={errors.suitesMin?.message}>
              <input {...register('suitesMin')} type="number" min={0} className={input()} placeholder="1" />
            </Field>
            <Field label="Suítes (máx)" error={errors.suitesMax?.message}>
              <input {...register('suitesMax')} type="number" min={0} className={input()} placeholder="3" />
            </Field>
            <Field label="Banheiros (mín)" error={errors.banheirosMin?.message}>
              <input {...register('banheirosMin')} type="number" min={0} className={input()} placeholder="1" />
            </Field>
            <Field label="Banheiros (máx)" error={errors.banheirosMax?.message}>
              <input {...register('banheirosMax')} type="number" min={0} className={input()} placeholder="3" />
            </Field>
            <Field label="Vagas (mín / tipo)">
              <select
                value={vagasMin}
                onChange={e => handleVagasMinChange(e.target.value)}
                className={input()}
              >
                <option value="">—</option>
                <option value="ROTATIVA">Rotativa</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </Field>
            <Field label="Vagas (máx)">
              <select
                value={vagasMax}
                onChange={e => setVagasMax(e.target.value)}
                disabled={vagasTipo === 'ROTATIVA'}
                className={input(vagasTipo === 'ROTATIVA' ? 'opacity-40 cursor-not-allowed' : '')}
              >
                <option value="">—</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </Field>
            <Field label="Nº de Torres" error={errors.numTorres?.message}>
              <input {...register('numTorres')} type="number" min={1} className={input()} placeholder="2" />
            </Field>
            <Field label="Nº de Andares" error={errors.numAndares?.message}>
              <input {...register('numAndares')} type="number" min={1} className={input()} placeholder="12" />
            </Field>
            <Field label="Latitude" error={errors.latitude?.message}>
              <input {...register('latitude')} type="number" step="any" className={input()} placeholder="-3.7318" />
            </Field>
            <Field label="Longitude" error={errors.longitude?.message}>
              <input {...register('longitude')} type="number" step="any" className={input()} placeholder="-38.5011" />
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

        {/* Amenidades */}
        <section className="bg-white rounded-2xl border border-brand-navy/5 shadow-sm p-6 lg:p-8">
          <h2 className="font-semibold text-brand-navy mb-2 text-lg">Amenidades / Diferenciais</h2>
          <p className="text-xs text-brand-navy/40 mb-5">Marque os itens disponíveis no empreendimento</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {AMENIDADES_LISTA.map(item => (
              <label key={item} className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors select-none ${
                amenidades.includes(item)
                  ? 'border-brand-marinho bg-brand-marinho/5 text-brand-marinho'
                  : 'border-brand-navy/10 text-brand-navy/50 hover:border-brand-marinho/40'
              }`}>
                <input
                  type="checkbox"
                  checked={amenidades.includes(item)}
                  onChange={() => toggleAmenidade(item)}
                  className="hidden"
                />
                <span className={`w-3.5 h-3.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  amenidades.includes(item) ? 'border-brand-marinho bg-brand-marinho' : 'border-brand-navy/20'
                }`}>
                  {amenidades.includes(item) && (
                    <svg viewBox="0 0 10 8" fill="none" className="w-2 h-2">
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <span className="text-xs font-medium leading-snug">{item}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Fotos */}
        <section className="bg-white rounded-2xl border border-brand-navy/5 shadow-sm p-6 lg:p-8">
          <h2 className="font-semibold text-brand-navy mb-6 text-lg">Fotos</h2>

          {empId ? (
            /* Modo edição — upload direto com FotoUploader */
            <FotoUploader empreendimentoId={empId} fotos={fotos} onChange={setFotos} />
          ) : (
            /* Modo criação — acumula localmente, envia ao salvar */
            <div>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-brand-marinho bg-cyan-50'
                    : 'border-brand-navy/10 hover:border-brand-marinho hover:bg-brand-navy/[0.02]'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2 text-brand-navy/40">
                  <Upload size={24} />
                  <p className="text-sm">
                    {isDragActive ? 'Solte as fotos aqui' : 'Arraste fotos ou clique para selecionar'}
                  </p>
                  <p className="text-xs text-brand-navy/30">
                    JPG, PNG, WebP · Máx 10 MB · As fotos serão enviadas ao salvar
                  </p>
                </div>
              </div>

              {pendingPreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                  {pendingPreviews.map((url, i) => (
                    <div key={url} className="relative aspect-square group rounded-lg overflow-hidden border border-brand-navy/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                      <button
                        type="button"
                        onClick={() => removePending(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-brand-navy/60 text-white rounded px-1.5 py-0.5 text-[9px] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ImageIcon size={9} /> Pendente
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

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
              onClick={handleSubmit(data => publishWith(data, 'PUBLICADO'))}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Publicar Agora
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit(data => publishWith(data, 'AGUARDANDO_APROVACAO'))}
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
