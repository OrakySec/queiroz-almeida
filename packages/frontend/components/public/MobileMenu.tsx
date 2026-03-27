'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useLeadModal } from '@/context/LeadModalContext'

const links = [
  { label: 'Início', href: '/' },
  { label: 'Quem Somos', href: '/#quem-somos' },
  { label: 'Empreendimentos', href: '/empreendimentos' },
  { label: 'Evolução da Obra', href: '/evolucao-da-obra' },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.3 } },
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: Props) {
  const { open: openLead } = useLeadModal()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[60] bg-brand-dark flex flex-col overflow-hidden"
        >
          {/* Blueprint Overlay */}
          <div className="absolute inset-0 bg-blueprint opacity-[0.05] pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between px-8 h-24 border-b border-white/5">
            <div className="w-16 h-16 overflow-hidden rounded-xl">
              <Image 
                src="/logo.png" 
                alt="Queiroz Almeida" 
                width={64} 
                height={64}
                className="object-contain w-full h-full" 
              />
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-brand-marinho transition-all"
              aria-label="Fechar"
            >
              <X size={24} />
            </button>
          </div>

          {/* Links */}
          <motion.nav
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="relative z-10 flex flex-col justify-center flex-1 px-8 py-12"
          >
            <div className="space-y-4">
              {links.map((link) => (
                <motion.div key={link.href} variants={itemVariants}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="group flex items-center justify-between py-4 border-b border-white/5"
                  >
                    <span className="font-serif text-4xl font-bold text-white group-hover:text-brand-marinho-glow transition-colors">
                      {link.label}
                    </span>
                    <ArrowRight size={24} className="text-brand-marinho-glow opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div variants={itemVariants} className="mt-16">
              <button
                onClick={() => { onClose(); openLead() }}
                className="shimmer-button w-full bg-brand-marinho text-white font-sans font-bold text-xs uppercase tracking-[0.2em] py-5 rounded-full"
              >
                Falar com especialista
              </button>
            </motion.div>
          </motion.nav>

          {/* Decorative Bottom */}
          <div className="relative z-10 p-8 border-t border-white/5">
            <p className="font-sans text-[10px] text-brand-silver/30 font-bold uppercase tracking-[0.3em] text-center">
              © 2024 Queiroz Almeida · Litoral de Elite
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
