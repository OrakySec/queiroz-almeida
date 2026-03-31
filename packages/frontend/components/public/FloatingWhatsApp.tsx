'use client'

import React from 'react'
import { MessageCircle } from 'lucide-react'

export function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/5581984008353"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-[9999] group"
      aria-label="Falar no WhatsApp"
    >
      {/* Pulse Effect */}
      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20 group-hover:opacity-40 transition-opacity" />
      
      {/* Button Container */}
      <div className="relative flex items-center justify-center w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl hover:scale-110 hover:-rotate-12 transition-all duration-300">
        <MessageCircle size={32} fill="currentColor" />
        
        {/* Label on Hover */}
        <div className="absolute right-full mr-4 bg-white text-brand-navy px-4 py-2 rounded-xl text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Falar com Especialista
        </div>
      </div>
    </a>
  )
}
