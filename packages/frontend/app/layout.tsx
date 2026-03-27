import type { Metadata } from 'next'
import { Outfit, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const garamond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-garamond',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Queiroz Almeida Construtora e Incorporadora',
    template: '%s | Queiroz Almeida',
  },
  description:
    'Flats de investimento no litoral nordestino. Empreendimentos em Porto de Galinhas e Maragogi com alto potencial de valorização.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'Queiroz Almeida Construtora',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${garamond.variable}`}>
      <body className="font-sans antialiased text-brand-texto bg-white selection:bg-brand-marinho/20 selection:text-brand-marinho">
        {children}
      </body>
    </html>
  )
}
