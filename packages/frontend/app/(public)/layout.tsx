import { LeadModalProvider } from '@/context/LeadModalContext'
import { Navbar } from '@/components/public/Navbar'
import { Footer } from '@/components/public/Footer'
import { LeadModal } from '@/components/public/LeadModal'
import { ProvasSocial } from '@/components/public/ProvasSocial'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LeadModalProvider>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <LeadModal />
      <ProvasSocial />
    </LeadModalProvider>
  )
}
