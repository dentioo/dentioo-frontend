export interface Plan {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  popular?: boolean
  trialDays?: number
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Grátis',
    price: 0,
    description: '14 dias gratuitos para começar',
    trialDays: 14,
    features: [
      'Até 10 pacientes',
      'Agenda básica',
      'Prontuários digitais',
      '1 usuário',
      '1GB de armazenamento',
      'Suporte por email',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 49.99,
    description: 'Para consultórios em início de atividade',
    popular: true,
    features: [
      'Até 100 pacientes',
      'Agenda básica',
      'Prontuários digitais',
      'Suporte por email',
      '1 usuário',
      '5GB de armazenamento',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99.99,
    description: 'Para consultórios em expansão',
    features: [
      'Pacientes ilimitados',
      'Agenda avançada',
      'Prontuários digitais',
      'Orçamentos PDF',
      'Até 3 usuários',
      '50GB de armazenamento',
      'Suporte prioritário',
      'Relatórios financeiros',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 129.99,
    description: 'Para consultórios consolidados',
    features: [
      'Tudo do Professional',
      'Usuários ilimitados',
      'Integração Google Drive',
      'Backup automático',
      'Armazenamento ilimitado',
      'Suporte 24/7',
      'API access',
      'Personalizações avançadas',
    ],
  },
]
