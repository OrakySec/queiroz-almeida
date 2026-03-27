const config = {
  RASCUNHO: { label: 'Rascunho', className: 'bg-gray-100 text-gray-600' },
  AGUARDANDO_APROVACAO: { label: 'Aguardando', className: 'bg-amber-100 text-amber-700' },
  PUBLICADO: { label: 'Publicado', className: 'bg-green-100 text-green-700' },
  REJEITADO: { label: 'Rejeitado', className: 'bg-red-100 text-red-700' },
} as const

type Status = keyof typeof config

export function StatusBadge({ status }: { status: string }) {
  const cfg = config[status as Status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center font-sans text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
