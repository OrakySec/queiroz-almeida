'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrolled } from '@/hooks/useScrolled'
import { useLeadModal } from '@/context/LeadModalContext'
import { MobileMenu } from './MobileMenu'

const links = [
  { label: 'Início', href: '/' },
  { label: 'Quem Somos', href: '/#quem-somos' },
  { label: 'Empreendimentos', href: '/empreendimentos' },
  { label: 'Evolução da Obra', href: '/evolucao-da-obra' },
]

export function Navbar() {
  const scrolled = useScrolled(20)
  const [menuOpen, setMenuOpen] = useState(false)
  const { open: openLead } = useLeadModal()

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 md:px-8 py-4 ${
          scrolled ? 'transform-none' : 'md:py-8'
        }`}
      >
        <div className={`max-w-7xl mx-auto transition-all duration-500 ${
          scrolled 
            ? 'glass-navbar rounded-full px-6 shadow-2xl border border-white/20' 
            : 'bg-transparent px-0'
        }`}>
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo Group */}
            <Link href="/" className="relative flex items-center group">
              <div className={`transition-all duration-500 overflow-hidden rounded-xl bg-transparent ${
                scrolled ? 'w-10 h-10 md:w-14 md:h-14' : 'w-20 h-20 md:w-28 md:h-28'
              }`}>
                <Image 
                  src="/logo.png" 
                  alt="Queiroz Almeida" 
                  width={200} 
                  height={200}
                  priority
                  className="object-contain w-full h-full" 
                />
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative font-sans text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-300 group ${
                    scrolled ? 'text-brand-navy' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full ${
                    scrolled ? 'bg-brand-marinho' : 'bg-brand-marinho-glow'
                  }`} />
                </Link>
              ))}
            </nav>

            {/* CTA Group */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => openLead()}
                className={`shimmer-button hidden lg:flex items-center justify-center font-sans text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-3 rounded-full transition-all duration-300 ${
                  scrolled
                    ? 'bg-brand-navy text-white hover:bg-brand-marinho'
                    : 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-brand-navy'
                }`}
              >
                Falar com especialista
              </button>

              <button
                onClick={() => setMenuOpen(true)}
                className={`lg:hidden p-2 rounded-full transition-all duration-300 ${
                  scrolled ? 'bg-brand-navy text-white' : 'bg-white/10 text-white backdrop-blur-md'
                }`}
                aria-label="Menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
