import type { Metadata } from 'next'
import { HomePageClient } from './home-client'

export const metadata: Metadata = {
  title: 'Dentioo - Gestão de Clínica Odontológica',
  description: 'A maneira mais fácil de gerenciar sua clínica odontológica. Agenda, pacientes, prontuários, orçamentos e gestão — tudo em um só lugar.',
}

export default function HomePage() {
  return <HomePageClient />
}
