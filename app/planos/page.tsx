import type { Metadata } from 'next'
import { PlanosPageClient } from './planos-client'

export const metadata: Metadata = {
  title: 'Dentioo - Meu Plano',
  description: 'Gerencie sua assinatura e histórico de planos',
}

export default function PlanosPage() {
  return <PlanosPageClient />
}
