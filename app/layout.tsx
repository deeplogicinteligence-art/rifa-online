import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rifa Online — Crie e gerencie rifas com facilidade',
  description: 'Crie rifas online, compartilhe o link e gerencie tudo pelo painel.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
