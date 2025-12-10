'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { PLANS } from '@/lib/plans'

interface SelectPlanProps {
  onSuccess?: () => void
  userEmail?: string
}

export default function SelectPlan({ onSuccess, userEmail }: SelectPlanProps) {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>('professional')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('manual')

  const handleSelectPlan = async () => {
    if (!selectedPlan) return

    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/subscriptions/request-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: selectedPlan,
          paymentMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Erro ao solicitar plano')
        setLoading(false)
        return
      }

      alert('✅ Solicitação enviada! Você receberá um email com as instruções de pagamento.')
      router.push('/dashboard')
    } catch (err) {
      setError('Erro ao conectar ao servidor')
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-gray-600">
            Seu teste expirou. Selecione um plano para continuar
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative rounded-xl overflow-hidden transition-all cursor-pointer ${
                selectedPlan === plan.id
                  ? 'ring-2 ring-offset-2 ring-indigo-600 shadow-xl'
                  : 'shadow-lg hover:shadow-xl'
              } ${plan.popular ? 'md:scale-105' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 text-sm font-semibold">
                  ⭐ MAIS POPULAR
                </div>
              )}

              {/* Card Content */}
              <div className={`bg-white p-8 h-full flex flex-col ${
                plan.popular ? `border-t-4 border-indigo-600` : ''
              }`}>
                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-8">
                  <div className="text-4xl font-bold text-gray-900">
                    R$ {plan.price.toFixed(2)}
                    <span className="text-lg font-normal text-gray-600">/mês</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Cobrado mensalmente
                  </p>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full py-3 rounded-lg font-semibold mb-8 transition ${
                    selectedPlan === plan.id
                      ? 'bg-purple-600 text-white'
                      : 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  {selectedPlan === plan.id ? '✓ Selecionado' : 'Selecionar'}
                </button>

                {/* Features */}
                <ul className="space-y-4 grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Method Selection */}
        {selectedPlan && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Método de Pagamento
            </h3>

            <div className="space-y-3">
              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="manual"
                  checked={paymentMethod === 'manual'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="ml-4">
                  <p className="font-medium text-gray-900">Transferência Bancária / Boleto</p>
                  <p className="text-sm text-gray-600">
                    Receba instruções para pagar e será aprovado em até 24h
                  </p>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="pix"
                  checked={paymentMethod === 'pix'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="ml-4">
                  <p className="font-medium text-gray-900">PIX</p>
                  <p className="text-sm text-gray-600">
                    Pague na hora com PIX
                  </p>
                </div>
              </label>

              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                  disabled
                />
                <div className="ml-4">
                  <p className="font-medium text-gray-900">Cartão de Crédito</p>
                  <p className="text-sm text-gray-600">
                    Em breve
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="max-w-2xl mx-auto flex gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
          >
            Voltar
          </button>
          <button
            onClick={handleSelectPlan}
            disabled={!selectedPlan || loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Continuar com Pagamento'}
          </button>
        </div>

        {/* Info Box */}
        <div className="max-w-2xl mx-auto mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            💡 <strong>Dica:</strong> Você pode cancelar a qualquer momento. Não há penalidade ou taxa de cancelamento.
          </p>
        </div>
      </div>
    </div>
  )
}
