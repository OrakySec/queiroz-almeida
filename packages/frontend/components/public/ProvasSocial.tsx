'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, ShieldCheck, TrendingUp } from 'lucide-react'

const mensagens = [
  { text: 'Um investidor de Recife acabou de solicitar o book do Porto Mau Loa', icon: Activity },
  { text: 'Novo agendamento confirmado para o Caminho do Mar — Maragogi', icon: ShieldCheck },
  { text: 'Há 3 investidores visualizando unidades no Porto Lagoa agora', icon: TrendingUp },
  { text: 'Nova assessoria iniciada com cliente de São Paulo', icon: Activity },
  { text: 'Unidade reservada no Porto Mau Loa — há poucos minutos', icon: ShieldCheck },
  { text: 'Investidor de Brasília solicitou simulação de renda do Porto Lagoa', icon: TrendingUp },
]

function getRandomInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function ProvasSocial() {
  const [visible, setVisible] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const initial = setTimeout(() => {
      setVisible(true)
    }, 6000)
    return () => clearTimeout(initial)
  }, [])

  useEffect(() => {
    if (!visible) return
    const hideTimer = setTimeout(() => {
      setVisible(false)
    }, 5500)
    return () => clearTimeout(hideTimer)
  }, [visible, index])

  useEffect(() => {
    if (visible) return
    const interval = getRandomInterval(12000, 18000)
    const next = setTimeout(() => {
      setIndex((i) => (i + 1) % mensagens.length)
      setVisible(true)
    }, interval)
    return () => clearTimeout(next)
  }, [visible])

  const Icon = mensagens[index].icon

  return (
    <div className="fixed bottom-4 left-4 md:bottom-10 md:left-10 z-[60] w-[calc(100%-2rem)] max-w-[280px] md:max-w-[320px] pointer-events-none">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(8px)" }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 25
            }}
            className="group relative"
          >
            {/* Deep Navy Glass Container — Compact Mode */}
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
                {mensagens[index].text}
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
