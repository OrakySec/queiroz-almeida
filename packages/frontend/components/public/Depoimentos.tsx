'use client'
import { Star, Quote, Award } from 'lucide-react'
import { motion } from 'framer-motion'

const depoimentos = [
  {
    id: '1',
    nome: 'Ricardo Menezes',
    cidade: 'Recife, PE',
    texto: 'Investi no Porto Lagoa Residence e superou todas as expectativas. A valorização foi além do projetado e a equipe da Queiroz Almeida acompanhou cada etapa com transparência total.',
    estrelas: 5,
    destaque: true,
    foto: '/assets/investidores/ricardo.png'
  },
  {
    id: '2',
    nome: 'Fernanda Cavalcanti',
    cidade: 'São Paulo, SP',
    texto: 'Com a Queiroz Almeida encontrei o empreendimento que alia qualidade construtiva e localização privilegiada.',
    estrelas: 5,
    destaque: false,
    foto: '/assets/investidores/fernanda.png'
  },
  {
    id: '3',
    nome: 'Carlos Henrique',
    cidade: 'Fortaleza, CE',
    texto: 'A solidez da empresa e a localização dos empreendimentos foram decisivos. Senti segurança em cada decisão.',
    estrelas: 5,
    destaque: false,
    foto: '/assets/investidores/carlos.png'
  },
  {
    id: '4',
    nome: 'Mariana Souza',
    cidade: 'Brasília, DF',
    texto: 'Comprei no Caminho do Mar em Maragogi. A estrutura do flat e o retorno com locação são excelentes.',
    estrelas: 5,
    destaque: true,
    foto: '/assets/investidores/mariana.png'
  },
  {
    id: '5',
    nome: 'Juliana Pimentel',
    cidade: 'João Pessoa, PB',
    texto: 'Atenção aos detalhes e acabamento impecável. Investir aqui é ter a certeza de um patrimônio sólido.',
    estrelas: 5,
    destaque: false,
    foto: '/assets/investidores/juliana.png'
  },
]

function TestimonialCard({ d, index }: { d: typeof depoimentos[0], index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.01 }}
      className={`relative group h-full rounded-[2.2rem] md:rounded-[2.5rem] p-6 md:p-10 overflow-hidden border transition-all duration-500
        ${d.destaque ? 'md:col-span-2 bg-white/5 backdrop-blur-xl border-white/10' : 'bg-brand-dark/40 border-white/5'}
      `}
    >
      {/* Visual Accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-marinho-glow/10 blur-[80px] group-hover:bg-brand-marinho-glow/20 transition-colors" />
      <Quote size={40} className="text-brand-marinho-glow/20 absolute top-6 md:top-8 right-6 md:right-8" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Stars */}
        <div className="flex gap-1 mb-6 md:mb-8">
          {[...Array(d.estrelas)].map((_, i) => (
            <Star 
              key={i} 
              size={12} 
              className="fill-amber-400 text-amber-400 md:w-3.5 md:h-3.5" 
              style={{ filter: 'drop-shadow(0 0 5px rgba(251, 191, 36, 0.4))' }}
            />
          ))}
        </div>

        {/* Text */}
        <p className={`font-sans text-white/70 leading-relaxed mb-6 md:mb-8 italic flex-grow 
          ${d.destaque ? 'text-base md:text-xl' : 'text-sm md:text-base'}
        `}>
          "{d.texto}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-4 border-t border-white/5 pt-6 md:pt-8">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-brand-marinho to-brand-navy rounded-full flex items-center justify-center border border-white/10 shadow-lg shrink-0 overflow-hidden relative">
            {d.foto ? (
              <img 
                src={d.foto} 
                alt={d.nome} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            ) : (
              <span className="font-serif font-bold text-white text-xs md:text-sm">
                {d.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-serif font-bold text-white text-base md:text-lg leading-tight">{d.nome}</h4>
            <span className="font-sans text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-brand-marinho-glow/60">{d.cidade}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function Depoimentos() {
  return (
    <section id="depoimentos" className="bg-brand-dark py-20 lg:py-40 overflow-hidden relative">
      {/* Background Architectural Elements */}
      <div className="absolute inset-0 bg-blueprint opacity-[0.05] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-brand-dark via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-brand-dark via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Social Proof Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 md:gap-12 mb-16 md:mb-20">
          <div className="max-w-2xl w-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-wrap items-center gap-4 mb-6 md:mb-8"
            >
              <div className="flex items-center gap-3 border-l-2 border-brand-marinho-glow pl-4 leading-none">
                <span className="font-sans text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-brand-marinho-glow shrink-0">
                  Quem Já Investiu
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-brand-marinho-glow/30 shrink-0" />
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={10} 
                        className="fill-amber-400 text-amber-400" 
                        style={{ filter: 'drop-shadow(0 0 5px rgba(251, 191, 36, 0.4))' }}
                      />
                    ))}
                  </div>
                  <span className="font-sans text-[9px] md:text-[10px] font-bold text-white/80 uppercase tracking-widest leading-none">
                    4.9 Trust Score
                  </span>
                </div>
              </div>
            </motion.div>

            <div className="overflow-hidden">
              <motion.h2
                initial={{ y: '100%' }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif font-bold text-white leading-[1.15] md:leading-[1.05]"
                style={{ fontSize: 'clamp(2.2rem, 9vw, 4rem)' }}
              >
                A confiança de quem já <em className="not-italic text-brand-marinho-glow font-medium italic">decidiu.</em>
              </motion.h2>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto mt-4 md:mt-0"
          >
            <div className="flex -space-x-4 mb-1 items-center">
              {depoimentos.slice(0, 5).map((d, i) => (
                <div 
                  key={d.id} 
                  className="w-9 h-9 md:w-11 md:h-11 rounded-full border-2 border-brand-dark bg-brand-navy overflow-hidden relative shadow-lg"
                  style={{ zIndex: 10 - i }}
                >
                  <img 
                    src={d.foto} 
                    alt={d.nome} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-brand-marinho/10" />
                </div>
              ))}
              <div className="relative translate-x-5 md:translate-x-8" style={{ zIndex: 0 }}>
                <motion.div 
                  animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 0 0px rgba(34, 211, 238, 0)",
                      "0 0 15px rgba(34, 211, 238, 0.4)",
                      "0 0 0px rgba(34, 211, 238, 0)"
                    ]
                  }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-brand-marinho-glow to-brand-marinho flex items-center justify-center font-sans text-[9px] md:text-[11px] font-black text-brand-dark shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                >
                  +500
                </motion.div>
                {/* Ambient Glow */}
                <div className="absolute -inset-3 bg-brand-marinho-glow/30 blur-xl rounded-full -z-10" />
              </div>
            </div>
            <p className="font-sans text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-white/30 text-center md:text-right">
              Investidores Atendidos
            </p>
          </motion.div>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {depoimentos.map((d, i) => (
            <TestimonialCard key={d.id} d={d} index={i} />
          ))}

          {/* Call to Action Card in Bento Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-brand-marinho rounded-[2.5rem] p-10 flex flex-col justify-center items-center text-center group cursor-pointer overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <Award size={48} className="text-white mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="font-serif font-bold text-white text-2xl mb-4">Seja o Próximo</h3>
            <p className="font-sans text-white/70 text-sm mb-8">
              Garanta seu patrimônio no litoral mais valorizado do Brasil.
            </p>
            <button className="bg-white text-brand-dark font-sans font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-full hover:bg-brand-marinho-glow hover:text-white transition-all">
              Falar com Consultor
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
