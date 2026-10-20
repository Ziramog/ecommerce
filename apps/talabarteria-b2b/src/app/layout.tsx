import type { Metadata } from 'next'
import './globals.css'
import { AuthB2BProvider } from '@/context/AuthB2BContext'
import { B2BCartProvider } from '@/context/B2BCartContext'
import { HeaderB2B } from '@/components/common/HeaderB2B'
import { FooterB2B } from '@/components/common/FooterB2B'

export const metadata: Metadata = {
  title: 'Talabartería Mercadal — Portal Mayorista B2B',
  description:
    'Portal privado de ventas mayoristas de Talabartería Mercadal. Aperos criollos, monturas de trabajo, lonjas para sogueo y platería para comercios y distribuidores.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-b2b-50 text-b2b-900 font-sans antialiased selection:bg-navy selection:text-white">
        <AuthB2BProvider>
          <B2BCartProvider>
            <HeaderB2B />
            <main className="flex-1">{children}</main>
            <FooterB2B />
          </B2BCartProvider>
        </AuthB2BProvider>
      </body>
    </html>
  )
}
