'use client'
import { useLeadModal } from '@/context/LeadModalContext'

interface Props {
  interesse?: string
  label?: string
  className?: string
}

export function LeadCTAButton({
  interesse,
  label = 'Quero mais informações',
  className = '',
}: Props) {
  const { open } = useLeadModal()
  return (
    <button
      onClick={() => open(interesse)}
      className={`w-full bg-brand-dourado text-white font-sans font-semibold py-4 rounded-lg hover:bg-opacity-90 active:scale-95 transition-all ${className}`}
    >
      {label}
    </button>
  )
}
