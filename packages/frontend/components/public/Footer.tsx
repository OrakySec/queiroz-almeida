import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Facebook, Youtube, Mail, Phone, ArrowUpRight } from 'lucide-react'

const navLinks = [
  { label: 'Início', href: '/' },
  { label: 'Quem Somos', href: '/#quem-somos' },
  { label: 'Empreendimentos', href: '/empreendimentos' },
  { label: 'Evolução da Obra', href: '/evolucao-da-obra' },
]

export function Footer() {
  return (
    <footer className="bg-brand-dark overflow-hidden relative border-t border-white/5">
      {/* Background blueprint overlay at footer */}
      <div className="absolute inset-0 bg-blueprint opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-24 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-24 pb-20 border-b border-white/5">

          {/* Brand Info (5/12) */}
          <div className="md:col-span-5">
            <div className="mb-8">
              <img 
                src="/logo.png?v=7" 
                alt="Queiroz Almeida" 
                style={{ 
                  width: '180px', 
                  height: 'auto', 
                  borderRadius: '100px', 
                  objectFit: 'contain',
                  display: 'block',
                  transition: 'all 0.5s ease-in-out'
                }} 
              />
            </div>
            <p className="font-sans text-sm text-brand-silver/75 leading-relaxed mb-10 max-w-sm">
              Referência em incorporação de alto padrão no litoral nordestino. 
              Criamos ativos imobiliários de elite para investidores que buscam 
              rentabilidade e exclusividade.
            </p>
            <div className="flex gap-6">
              <a href="https://www.instagram.com/queirozalmeidaconstrutora/" target="_blank" rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:border-brand-marinho-glow hover:text-brand-marinho-glow transition-all"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a href="mailto:contato@queirozalmeidaconstrutora.com.br" 
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:border-brand-marinho-glow hover:text-brand-marinho-glow transition-all"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Navigation (3/12) */}
          <div className="md:col-span-3">
            <h3 className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-brand-marinho-glow mb-10">
              Menu Executivo
            </h3>
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="flex items-center gap-2 group font-sans text-xs font-semibold text-brand-silver/75 hover:text-white transition-all">
                    <span className="w-0 h-px bg-brand-marinho-glow group-hover:w-4 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact (4/12) */}
          <div className="md:col-span-4">
            <h3 className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-brand-marinho-glow mb-10">
              Escritório Central
            </h3>
            <ul className="space-y-6">
              <li>
                <a href="mailto:contato@queirozalmeidaconstrutora.com.br"
                  className="flex flex-col gap-1 text-brand-silver/75 hover:text-white transition-colors group">
                  <span className="font-sans text-[9px] uppercase tracking-widest text-brand-silver/50 group-hover:text-brand-marinho-glow">E-mail</span>
                  <span className="font-sans text-sm font-medium">contato@queirozalmeidaconstrutora.com.br</span>
                </a>
              </li>
              <li>
                <a href="tel:+5581999999999" className="flex flex-col gap-1 text-brand-silver/75 hover:text-white transition-colors group">
                  <span className="font-sans text-[9px] uppercase tracking-widest text-brand-silver/50 group-hover:text-brand-marinho-glow">Atendimento</span>
                  <span className="font-sans text-sm font-medium">(81) 99999-9999</span>
                </a>
              </li>
              <li className="pt-4">
                <a href="https://wa.me/5581999999999" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-4 bg-white/5 border border-white/10 text-white font-sans text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-full hover:bg-brand-marinho-glow hover:text-brand-navy hover:border-brand-marinho-glow transition-all group">
                  WhatsApp Executivo
                  <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-brand-silver/50">© 2024 Queiroz Almeida</span>
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-brand-silver/50">CNPJ: 00.000.000/0001-00</span>
          </div>
          <div className="flex items-center gap-6">
             <span className="font-sans text-[9px] text-brand-silver/30 uppercase tracking-widest">Powered by Premium Design</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
