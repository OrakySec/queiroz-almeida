'use client'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2 } from 'lucide-react'
import { useLeadModal } from '@/context/LeadModalContext'
import { FormLead } from './FormLead'

const micros = [
  { text: 'Valores Atualizados' },
  { text: 'Simulação de Renda' },
  { text: 'Acesso Antecipado' },
]

export function LeadModal() {
  const { isOpen, close, interesse } = useLeadModal()

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [close])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-brand-dark/80 backdrop-blur-md"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg md:max-w-2xl bg-white rounded-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
            >
              {/* Header — fixo */}
              <div className="bg-brand-dark px-8 pt-8 pb-7 relative overflow-hidden rounded-t-3xl shrink-0">
                <div className="absolute inset-0 bg-blueprint opacity-[0.05] pointer-events-none" />

                <div className="relative z-10 flex justify-between items-start mb-5">
                  <div className="max-w-xs">
                    <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-brand-marinho-glow block mb-3 border-l border-brand-marinho-glow pl-3 leading-none">
                      Consultoria Exclusiva
                    </span>
                    <h2 className="font-serif font-bold text-2xl md:text-3xl text-white leading-tight">
                      Invista com{' '}
                      <em className="not-italic text-brand-marinho-glow font-medium">confiança total.</em>
                    </h2>
                  </div>
                  <button
                    onClick={close}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all shrink-0 ml-4"
                    aria-label="Fechar"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="relative z-10 flex flex-wrap gap-4">
                  {micros.map((m) => (
                    <div key={m.text} className="flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-brand-marinho-glow" />
                      <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-brand-silver/50">{m.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form — scrollável */}
              <div className="px-8 py-6 bg-white rounded-b-3xl overflow-y-auto">
                <FormLead interesseInicial={interesse} onSuccess={close} />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
