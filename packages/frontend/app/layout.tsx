import type { Metadata } from 'next'
import { Outfit, Playfair_Display } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Queiroz Almeida | Investimento Imobiliário de Alto Padrão no Litoral',
    template: '%s | Queiroz Almeida Construtora',
  },
  description:
    'Invista nos melhores flats do litoral nordestino. Empreendimentos exclusivos em Porto de Galinhas e Maragogi com alta rentabilidade e valorização garantida. Conheça nossos projetos!',
  keywords: ['construtora', 'incorporadora', 'investimento imobiliário', 'flats no litoral', 'Porto de Galinhas', 'Maragogi', 'imóveis de luxo', 'rentabilidade'],
  authors: [{ name: 'Queiroz Almeida Construtora' }],
  creator: 'Queiroz Almeida',
  publisher: 'Queiroz Almeida',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Queiroz Almeida | Investimento Imobiliário de Alto Padrão no Litoral',
    description: 'Invista nos melhores flats do litoral nordestino com alta rentabilidade e valorização.',
    type: 'website',
    locale: 'pt_BR',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://queirozalmeidaconstrutora.com.br',
    siteName: 'Queiroz Almeida Construtora',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Queiroz Almeida Construtora',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Queiroz Almeida Construtora',
    description: 'Investimento imobiliário de alto padrão no litoral nordestino.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

import { FloatingWhatsApp } from '@/components/public/FloatingWhatsApp'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${playfair.variable}`}>
      <head>
        <link rel="preconnect" href="https://storage.queirozalmeidaconstrutora.com.br" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.teste.ykaromarques.com" crossOrigin="anonymous" />
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5P5L2PHN');`
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body className="font-sans antialiased text-brand-texto bg-white selection:bg-brand-marinho/20 selection:text-brand-marinho">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5P5L2PHN"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Queiroz Almeida Construtora e Incorporadora',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://queirozalmeidaconstrutora.com.br',
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://queirozalmeidaconstrutora.com.br'}/logo.png`,
              sameAs: [
                'https://www.instagram.com/queirozalmeidaconstrutora/',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+55-81-99999-9999',
                contactType: 'sales',
                areaServed: 'BR',
                availableLanguage: 'Portuguese',
              },
            }),
          }}
        />
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  )
}
