'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react'
import { formatWhatsApp } from '@/lib/utils'

const schema = z.object({
  nome: z.string().min(2, 'Informe seu nome completo'),
  whatsapp: z.string().min(14, 'Informe um WhatsApp válido'),
  email: z.string().email('Informe um e-mail válido'),
  interesse: z.string().optional(),
  tipo_usuario: z.enum(['CLIENTE', 'CORRETOR'], { required_error: 'Selecione o tipo de usuário' }),
  tipo_corretor: z.enum(['AUTONOMO', 'IMOBILIARIA']).optional(),
  imobiliaria: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.tipo_usuario === 'CORRETOR' && !data.tipo_corretor) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecione o tipo de corretor', path: ['tipo_corretor'] })
  }
  if (data.tipo_usuario === 'CORRETOR' && data.tipo_corretor === 'IMOBILIARIA' && !data.imobiliaria?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Informe o nome da imobiliária', path: ['imobiliaria'] })
  }
})

type FormData = z.infer<typeof schema>

interface Props {
  interesseInicial?: string
  onSuccess?: () => void
}

export function FormLead({ interesseInicial, onSuccess }: Props) {
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { interesse: interesseInicial || '' },
  })

  const whatsapp     = watch('whatsapp')
  const tipoUsuario  = watch('tipo_usuario')
  const tipoCorretor = watch('tipo_corretor')

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, origem: window.location.href }),
      })
      if (!res.ok) throw new Error()
      setSuccess(true)
      setTimeout(() => { onSuccess?.() }, 3000)
    } catch {
      alert('Erro ao enviar. Tente novamente.')
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-5">
        <div className="w-20 h-20 bg-brand-marinho/10 rounded-full flex items-center justify-center">
          <CheckCircle2 size={36} className="text-brand-marinho" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-2xl text-brand-navy mb-2">Solicitação Enviada.</h3>
          <p className="font-sans text-sm text-brand-navy/40 max-w-xs mx-auto leading-relaxed">
            Um consultor especializado entrará em contato em breve.
          </p>
        </div>
      </div>
    )
  }

  const inputClass = "w-full bg-brand-navy/[0.03] border border-brand-navy/5 rounded-2xl px-5 py-4 font-sans text-sm text-brand-navy placeholder:text-brand-navy/20 focus:outline-none focus:ring-2 focus:ring-brand-marinho/20 focus:border-brand-marinho focus:bg-white transition-all duration-300"
  const labelClass = "block font-sans text-[10px] font-black uppercase tracking-[0.3em] text-brand-navy/40 mb-3 ml-1"

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Nome */}
      <div className="group/input">
        <label className={labelClass}>Nome Completo</label>
        <input {...register('nome')} placeholder="Ex: João Silva" className={inputClass} />
        {errors.nome && <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest leading-none">{errors.nome.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* WhatsApp */}
        <div className="group/input">
          <label className={labelClass}>WhatsApp</label>
          <input
            value={whatsapp}
            onChange={(e) => setValue('whatsapp', formatWhatsApp(e.target.value), { shouldValidate: true })}
            placeholder="(00) 00000-0000"
            maxLength={15}
            className={inputClass}
          />
          {errors.whatsapp && <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest leading-none">{errors.whatsapp.message}</p>}
        </div>

        {/* E-mail */}
        <div className="group/input">
          <label className={labelClass}>E-mail</label>
          <input {...register('email')} type="email" placeholder="seu@email.com" className={inputClass} />
          {errors.email && <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest leading-none">{errors.email.message}</p>}
        </div>
      </div>

      {/* Tipo de usuário */}
      <div>
        <label className={labelClass}>Você é</label>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: 'CLIENTE',  label: 'Cliente' },
            { value: 'CORRETOR', label: 'Corretor' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setValue('tipo_usuario', opt.value, { shouldValidate: true })
                setValue('tipo_corretor', undefined)
                setValue('imobiliaria', '')
              }}
              className={`py-4 rounded-2xl border font-sans text-sm font-semibold transition-all duration-200 ${
                tipoUsuario === opt.value
                  ? 'bg-brand-navy text-white border-brand-navy shadow-lg'
                  : 'bg-brand-navy/[0.03] border-brand-navy/5 text-brand-navy/60 hover:border-brand-marinho/30 hover:text-brand-navy'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {errors.tipo_usuario && <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest leading-none">{errors.tipo_usuario.message}</p>}
      </div>

      {/* Se corretor: autônomo ou imobiliária */}
      {tipoUsuario === 'CORRETOR' && (
        <div>
          <label className={labelClass}>Tipo de Corretor</label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: 'AUTONOMO',    label: 'Autônomo' },
              { value: 'IMOBILIARIA', label: 'De Imobiliária' },
            ] as const).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setValue('tipo_corretor', opt.value, { shouldValidate: true })
                  setValue('imobiliaria', '')
                }}
                className={`py-4 rounded-2xl border font-sans text-sm font-semibold transition-all duration-200 ${
                  tipoCorretor === opt.value
                    ? 'bg-brand-navy text-white border-brand-navy shadow-lg'
                    : 'bg-brand-navy/[0.03] border-brand-navy/5 text-brand-navy/60 hover:border-brand-marinho/30 hover:text-brand-navy'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {errors.tipo_corretor && <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest leading-none">{errors.tipo_corretor.message}</p>}
        </div>
      )}

      {/* Se imobiliária: qual */}
      {tipoUsuario === 'CORRETOR' && tipoCorretor === 'IMOBILIARIA' && (
        <div className="group/input">
          <label className={labelClass}>Nome da Imobiliária</label>
          <input
            {...register('imobiliaria')}
            placeholder="Ex: Imobiliária Central"
            className={inputClass}
          />
          {errors.imobiliaria && <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest leading-none">{errors.imobiliaria.message}</p>}
        </div>
      )}

      {/* Submit */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="shimmer-button w-full bg-brand-navy text-white font-sans font-black text-[11px] uppercase tracking-[0.4em] py-5 rounded-full hover:bg-brand-marinho transition-all flex items-center justify-center gap-4 disabled:opacity-60 disabled:cursor-not-allowed shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              Falar com Especialista <ArrowRight size={16} />
            </>
          )}
        </button>
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="w-1 h-1 rounded-full bg-green-500" />
          <p className="font-sans text-[9px] text-brand-navy/30 uppercase tracking-[0.2em] font-bold">
            Conexão Segura e Criptografada
          </p>
        </div>
      </div>
    </form>
  )
}
