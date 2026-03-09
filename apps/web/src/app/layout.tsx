import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProviderWrapper } from '@/components/providers/ClerkProviderWrapper'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'HyperHub - Tu Espacio Seguro',
  description:
    'Red social disenada desde cero para personas con TDAH. No es otra red social adaptada -- es la primera construida entendiendo como funciona tu cerebro.',
  keywords: ['TDAH', 'ADHD', 'red social', 'neurodivergente', 'comunidad'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-[var(--background)] font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProviderWrapper>{children}</ClerkProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
