import { EmpreendimentoForm } from '@/components/admin/EmpreendimentoForm'

export default function NovoEmpreendimentoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Novo Empreendimento</h1>
        <p className="text-sm text-brand-navy/50 mt-1">Preencha os dados e salve como rascunho ou envie para aprovação.</p>
      </div>
      <EmpreendimentoForm mode="create" />
    </div>
  )
}
