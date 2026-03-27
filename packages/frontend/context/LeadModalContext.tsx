'use client'
import { createContext, useContext, useState } from 'react'

interface LeadModalContextType {
  isOpen: boolean
  interesse?: string
  open: (interesse?: string) => void
  close: () => void
}

const LeadModalContext = createContext<LeadModalContextType | null>(null)

export function LeadModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [interesse, setInteresse] = useState<string | undefined>()

  return (
    <LeadModalContext.Provider
      value={{
        isOpen,
        interesse,
        open: (i) => { setInteresse(i); setIsOpen(true) },
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </LeadModalContext.Provider>
  )
}

export function useLeadModal() {
  const ctx = useContext(LeadModalContext)
  if (!ctx) throw new Error('useLeadModal must be inside LeadModalProvider')
  return ctx
}
