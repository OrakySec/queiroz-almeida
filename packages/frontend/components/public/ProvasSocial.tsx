'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, ShieldCheck, TrendingUp, type LucideIcon } from 'lucide-react'

type MensagemStatic  = { tipo: 'static';  text: string;     icon: LucideIcon }
type MensagemDynamic = { tipo: 'dynamic'; template: string; icon: LucideIcon }
type Mensagem = MensagemStatic | MensagemDynamic

const MENSAGENS: Mensagem[] = [
  { tipo: 'dynamic', template: 'Um investidor de Recife acabou de solicitar o book do',    icon: Activity    },
  { tipo: 'dynamic', template: 'Novo agendamento confirmado para',                          icon: ShieldCheck },
  { tipo: 'dynamic', template: 'Há 3 investidores visualizando unidades no',               icon: TrendingUp  },
  { tipo: 'static',  text: 'Nova assessoria iniciada com cliente de São Paulo',             icon: Activity    },
  { tipo: 'dynamic', template: 'Unidade reservada no',                                     icon: ShieldCheck },
  { tipo: 'dynamic', template: 'Investidor de Brasília solicitou simulação de renda do',   icon: TrendingUp  },
]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function buildText(m: Mensagem, nomes: string[]): string | null {
  if (m.tipo === 'static') return m.text
  if (nomes.length === 0) return null
  return `${m.template} ${pickRandom(nomes)}`
}

export function ProvasSocial() {
  const [visible, setVisible]   = useState(false)
  const [index, setIndex]       = useState(0)
  const [nomes, setNomes]       = useState<string[]>([])
  const [text, setText]         = useState<string | null>(null)

  // Carrega nomes dos empreendimentos publicados
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/empreendimentos`)
      .then(r => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data) && data.length > 0) {
          setNomes((data as { nome: string }[]).map(e => e.nome))
        }
      })
      .catch(() => {})
  }, [])

  // Primeira exibição após 6s
  useEffect(() => {
    const t = setTimeout(() => {
      const t0 = buildText(MENSAGENS[0], nomes)
      if (t0) { setText(t0); setVisible(true) }
    }, 6000)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nomes])

  // Esconde após 5.5s visível
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setVisible(false), 5500)
    return () => clearTimeout(t)
  }, [visible, index])

  // Avança para próxima mensagem após intervalo aleatório
  useEffect(() => {
    if (visible) return
    const delay = getRandomInterval(12000, 18000)
    const t = setTimeout(() => {
      const nextIndex = (index + 1) % MENSAGENS.length
      const nextText  = buildText(MENSAGENS[nextIndex], nomes)
      setIndex(nextIndex)
      if (nextText) { setText(nextText); setVisible(true) }
    }, delay)
    return () => clearTimeout(t)
  }, [visible, index, nomes])

  const Icon = MENSAGENS[index].icon

  return (
    <div className="fixed bottom-4 left-4 md:bottom-10 md:left-10 z-[60] w-[calc(100%-2rem)] max-w-[280px] md:max-w-[320px] pointer-events-none">
      <AnimatePresence mode="wait">
        {visible && text && (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(8px)' }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
            className="group relative"
          >
            {/* Deep Navy Glass Container */}
            <div className="bg-brand-dark/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] rounded-full md:rounded-[2rem] py-3 px-5 md:py-4 md:px-6 flex flex-col gap-0.5 md:gap-1 overflow-hidden">

              {/* Internal Maritime Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-marinho-glow/10 to-transparent pointer-events-none" />

              <div className="flex items-center gap-2 relative z-10">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-marinho-glow opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-marinho-glow" />
                </span>
                <span className="font-sans text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] text-brand-marinho-glow">
                  Atividade Recente
                </span>
              </div>

              <p className="font-sans text-[10px] md:text-[12px] leading-tight md:leading-snug text-white/90 font-medium relative z-10">
                {text}
              </p>

              {/* Minimal Blueprint Detail */}
              <div className="absolute top-0 right-0 w-4 h-4 opacity-10">
                <div className="absolute top-2 right-0 w-3 h-px bg-white" />
                <div className="absolute top-0 right-2 w-px h-3 bg-white" />
              </div>
            </div>

            {/* Accent Shadow */}
            <div className="absolute -inset-0.5 bg-brand-marinho-glow/5 blur-xl -z-10 rounded-2xl md:rounded-[2rem]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
