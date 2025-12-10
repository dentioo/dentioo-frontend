'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Check, ArrowLeft } from 'lucide-react'

const planDetails = {
  starter: {
    name: 'Starter',
    price: 49.99,
    description: 'Para consultórios em início de atividade',
    features: [
      'Até 100 pacientes',
      'Agenda básica',
      'Prontuários digitais',
      'Suporte por email',
      '1 usuário',
      '5GB de armazenamento',
    ],
  },
  professional: {
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
  premium: {
    name: 'Premium',
    price: 129.99,
    description: 'Para consultórios consolidados',
    features: [
      'Tudo do Professional',
      'Usuários ilimitados',
      'Integração Google Drive',
      'Backup automático',
      'Unlimited armazenamento',
      'Suporte 24/7',
      'API access',
      'Personalizações avançadas',
    ],
  },
}

function PagamentoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const plano = searchParams.get('plano')
    if (plano) {
      setSelectedPlan(plano.toLowerCase())
    }
  }, [searchParams])

  const plan = selectedPlan ? planDetails[selectedPlan as keyof typeof planDetails] : null

  const handlePayment = async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/payment/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
          amount: plan?.price,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao processar pagamento')
      }

      const data = await response.json()
      
      // Aqui você pode integrar com um serviço de pagamento como Stripe, Mercado Pago, etc.
      // Por enquanto, vamos apenas mostrar uma mensagem de sucesso
      alert('Solicitação de pagamento enviada! O administrador analisará sua solicitação.')
      router.push('/dashboard/insights')
    } catch (err) {
      setError('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!plan) {
    return (
      <div className="flex flex-col h-screen bg-white">
        {/* MVP Banner */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white text-center py-2 px-4 text-xs sm:text-sm font-medium">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 max-w-[100rem] mx-auto">
            <span className="inline-flex items-center gap-1.5">
              <span>Este produto se encontra em fase de testes</span>
              <span className="font-mono text-xs">{"</>"}</span>
            </span>
            <span className="hidden sm:inline opacity-75">|</span>
            <span className="opacity-90">Para mais informações consulte o desenvolvedor</span>
          </div>
        </div>
        <Navbar />
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Plano não encontrado</p>
            <button
              onClick={() => router.push('/planos')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* MVP Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white text-center py-2 px-4 text-xs sm:text-sm font-medium">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 max-w-[100rem] mx-auto">
          <span className="inline-flex items-center gap-1.5">
            <span>Este produto se encontra em fase de testes</span>
            <span className="font-mono text-xs">{"</>"}</span>
          </span>
          <span className="hidden sm:inline opacity-75">|</span>
          <span className="opacity-90">Para mais informações consulte o desenvolvedor</span>
        </div>
      </div>
      <Navbar />
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-y-auto">
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-12 xl:px-16 py-8 lg:py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <button
              onClick={() => router.push('/planos')}
              className="flex items-center gap-2 text-color-primary hover:text-color-primary-light transition mb-8 cursor-pointer"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Plan Summary */}
              <div className="bg-white rounded-xl p-8 border border-color-neutral-light">
                <h1 className="text-3xl font-bold text-color-primary mb-4">{plan.name}</h1>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <div className="mb-8 pb-8 border-b border-color-neutral-light">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-color-primary">
                      R$ {plan.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-gray-600 text-sm">/mês</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check size={20} className="text-color-success shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>✓ Sem cartão de crédito obrigatório</strong>
                  </p>
                  <p className="text-sm text-blue-800 mt-2">
                    Você será direcionado para análise do administrador após o pagamento.
                  </p>
                </div>
              </div>

              {/* Payment Form */}
              <div className="bg-white rounded-xl p-8 border border-color-neutral-light h-fit">
                <h2 className="text-2xl font-bold text-color-primary mb-6">Resumo do Pedido</h2>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Plano</span>
                    <span className="font-semibold text-gray-900">{plan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Valor mensal</span>
                    <span className="font-semibold text-gray-900">
                      R$ {plan.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-color-neutral-light">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-color-primary">
                      R$ {plan.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full bg-color-primary-light text-white py-3 rounded-lg font-semibold hover:bg-[#0d2847] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Processando...' : 'Continuar com o Pagamento'}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Ao continuar, você concorda com nossos Termos de Serviço
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PagamentoPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-screen bg-white">
        <Navbar />
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    }>
      <PagamentoContent />
    </Suspense>
  )
}
