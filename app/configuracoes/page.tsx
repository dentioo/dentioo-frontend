import type { Metadata } from 'next'
import { ConfiguracoesPageClient } from './configuracoes-client'

export const metadata: Metadata = {
  title: 'Dentioo - Configurações',
  description: 'Configurações da clínica',
}

export default function ConfiguracoesPage() {
  return <ConfiguracoesPageClient />
}
