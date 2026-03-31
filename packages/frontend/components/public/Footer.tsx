import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Mail, ArrowUpRight, MapPin, MessageCircle } from 'lucide-react'

const navLinks = [
  { label: 'Início', href: '/' },
  { label: 'Quem Somos', href: '/#quem-somos' },
  { label: 'Empreendimentos', href: '/empreendimentos' },
]

const destinations = [
  { city: 'Porto de Galinhas', desc: 'Litoral Sul · PE' },
  { city: 'Maragogi', desc: 'Litoral Norte · AL' },
]

export function Footer() {
  return (
    <footer className="bg-brand-navy overflow-hidden relative border-t border-white/5">
      {/* Background radial glow & blueprint */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-marinho/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-blueprint opacity-[0.03] pointer-events-none mix-blend-overlay" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8 pb-24 border-b border-white/5">

          {/* Col 1: Identity (5/12) */}
          <div className="lg:col-span-5 space-y-10">
            <Link href="/" className="inline-block transition-transform hover:scale-105 duration-500">
              <img 
                src="/logo.png?v=7" 
                alt="Queiroz Almeida" 
                className="w-44 md:w-52 h-auto rounded-full bg-white/5 backdrop-blur-sm p-1 border border-white/10"
              />
            </Link>
            <div className="space-y-6">
              <h4 className="font-serif italic text-2xl text-white/90 leading-tight max-w-[280px]">
                Construindo o amanhã no <span className="text-brand-marinho-glow">paraíso hoje.</span>
              </h4>
              <p className="font-sans text-[13px] text-brand-silver/60 leading-relaxed max-w-sm font-medium">
                Referência em incorporação de luxo no litoral nordestino. Ativos imobiliários de elite para investidores que buscam rentabilidade absoluta.
              </p>
            </div>
            {/* Social Glassmorphism */}
            <div className="flex flex-col gap-6">
              <div className="flex gap-4">
                <a href="https://www.instagram.com/queirozalmeidaconstrutora/" target="_blank" rel="noopener noreferrer" 
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-brand-marinho-glow hover:text-brand-navy hover:border-brand-marinho-glow hover:-translate-y-1 transition-all duration-500 shadow-xl"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a href="mailto:contato@queirozalmeidaconstrutora.com.br" 
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-brand-marinho-glow hover:text-brand-navy hover:border-brand-marinho-glow hover:-translate-y-1 transition-all duration-500 shadow-xl"
                  aria-label="Email"
                >
                  <Mail size={20} />
                </a>
              </div>
              
              <a href="https://wa.me/5581999999999" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 w-fit bg-white/5 border border-white/10 px-6 py-3 rounded-2xl group hover:bg-brand-marinho-glow hover:border-brand-marinho-glow transition-all duration-500 shadow-xl"
              >
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-brand-navy/20 group-hover:border-transparent transition-all">
                  <MessageCircle size={16} className="text-brand-marinho-glow group-hover:text-brand-navy" />
                </div>
                <span className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-white/60 group-hover:text-brand-navy">WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Col 2: Navigation (3/12) */}
          <div className="lg:col-span-3 lg:ml-8">
            <h3 className="font-serif font-bold text-lg text-white mb-10 tracking-wide">Diretório</h3>
            <ul className="space-y-5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="flex items-center gap-3 group font-sans text-[11px] font-black uppercase tracking-[0.2em] text-brand-silver/50 hover:text-brand-marinho-glow transition-all duration-300">
                    <div className="w-1 h-1 rounded-full bg-brand-marinho-glow scale-0 group-hover:scale-100 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Destinations (4/12) */}
          <div className="lg:col-span-4 lg:ml-8">
            <h3 className="font-serif font-bold text-lg text-white mb-10 tracking-wide">Destinos</h3>
            <div className="space-y-8">
              {destinations.map((dest) => (
                <div key={dest.city} className="group cursor-default">
                  <div className="flex items-center gap-3 mb-1">
                    <MapPin size={12} className="text-brand-marinho-glow" />
                    <span className="font-sans text-[11px] font-black uppercase tracking-[0.2em] text-white/80 transition-colors group-hover:text-white">
                      {dest.city}
                    </span>
                  </div>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-brand-silver/40 pl-6">
                    {dest.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-12 flex flex-col-reverse md:flex-row items-center justify-between gap-10">
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4 justify-center md:justify-start">
            <span className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-brand-silver/25">
              © 2024 Queiroz Almeida
            </span>
            <span className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-brand-silver/25">
              CNPJ: 00.000.000/0001-00
            </span>
          </div>
          <a 
            href="https://www.instagram.com/oykaromarques.ia/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-4 group relative overflow-hidden px-4 py-2 rounded-xl transition-all duration-500"
          >
            {/* Efeito de Brilho (Shine) no Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none" />
            
            <span className="font-serif italic text-xs md:text-sm text-brand-silver/90">Desenvolvido por</span>
            <img src="/assinatura.png" alt="Assinatura" className="h-10 md:h-12 w-auto object-contain" />
          </a>
        </div>
      </div>
    </footer>
  )
}
