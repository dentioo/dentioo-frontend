'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Clock, CheckCircle, Lock } from 'lucide-react'
import { useTrialExpirationCheck } from '@/hooks/use-trial-expiration-check'

interface SubscriptionStatus {
  plan: string
  plan_type?: string
  plan_name?: string
  status: string
  trial_ends_at?: string
  subscription_ends_at?: string
  is_approved_by_admin?: boolean
  days_remaining?: number
  milliseconds_remaining?: number
}

export default function SubscriptionStatusComponent() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Calcular milliseconds restantes para o hook (sempre executar, mesmo se subscription for null)
  const msRemaining = subscription?.plan === 'trial' && subscription?.status === 'active'
    ? subscription.milliseconds_remaining || 0
    : null

  // Hook deve ser chamado sempre no topo, antes de qualquer return condicional
  useTrialExpirationCheck({
    millisecondsRemaining: msRemaining,
    isActive: subscription?.plan === 'trial' && subscription?.status === 'active',
    checkInterval: 5000, // Verificar a cada 5 segundos
  })

  useEffect(() => {
    fetchSubscriptionStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/trial/status`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Erro ao carregar subscription')
        setLoading(false)
        return
      }

      // Atualizar subscription com dados completos incluindo plan_type
      const subscriptionData = {
        ...data.data.subscription,
        plan_type: data.data.subscription.plan_type || data.data.plan_type,
        plan_name: data.data.subscription.plan_name || data.data.plan_name,
      }
      setSubscription(subscriptionData)
      setLoading(false)

      // Verificar se expirou
      if (data.data.subscription.status === 'expired' || !data.data.is_active) {
        // Disparar evento para atualizar outros componentes
        window.dispatchEvent(new CustomEvent('trial-expired'))
        setTimeout(() => {
          router.push('/planos')
        }, 1000)
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor')
      console.error(err)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    )
  }

  if (!subscription) {
    return null
  }

  // Trial Active
  if (subscription.plan === 'trial' && subscription.status === 'active') {
    // Cálculo identico ao CountdownTimer da página de chaves
    const ms = subscription.milliseconds_remaining || 0
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)

    // Construir texto IGUAL ao CountdownTimer
    let timeText = ''
    if (days > 0) timeText += `${days}d `
    if (hours > 0 || days > 0) timeText += `${String(hours).padStart(2, '0')}h `
    if (minutes > 0 || hours > 0 || days > 0) timeText += `${String(minutes).padStart(2, '0')}m `
    timeText += `${String(seconds).padStart(2, '0')}s`

    const isExpiringSoon = days <= 3 && hours <= 23

    return (
      <div className={`rounded-lg border-l-4 p-4 ${
        isExpiringSoon ? 'bg-yellow-50 border-yellow-400' : 'bg-blue-50 border-blue-400'
      }`}>
        <div className="flex items-start gap-3">
          <Clock className={`w-5 h-5 shrink-0 mt-0.5 ${
            isExpiringSoon ? 'text-yellow-600' : 'text-blue-600'
          }`} />
          <div className="grow">
            <h3 className={`font-semibold ${isExpiringSoon ? 'text-yellow-900' : 'text-blue-900'}`}>
              {subscription.plan_name || subscription.plan_type || 'Teste Grátis'} Ativo
            </h3>
            <p className={`text-sm ${isExpiringSoon ? 'text-yellow-800' : 'text-blue-800'}`}>
              Você tem <strong>{timeText.trim()}</strong> de teste restante
            </p>
            {isExpiringSoon && (
              <p className="text-sm text-yellow-800 mt-2 font-medium">
                ⚠️ Seu teste está expirando em breve! Escolha um plano para continuar.
              </p>
            )}
          </div>
          {isExpiringSoon && (
            <button
              onClick={() => router.push('/planos')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 whitespace-nowrap"
            >
              Ativar Chave
            </button>
          )}
        </div>
      </div>
    )
  }

  // Trial Expired
  if (subscription.plan === 'trial' && subscription.status === 'expired') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div className="grow">
            <h3 className="font-semibold text-red-900">
              Teste Expirado
            </h3>
            <p className="text-sm text-red-800">
              Seu teste de 14 dias terminou. Escolha um plano para continuar usando o Dentioo.
            </p>
          </div>
          <button
            onClick={() => router.push('/planos')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 whitespace-nowrap"
          >
            Ativar Chave
          </button>
        </div>
      </div>
    )
  }

  // Paid Plan Active
  if (['basic', 'professional', 'enterprise'].includes(subscription.plan) && subscription.status === 'active') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-green-600" />
          <div className="grow">
            <h3 className="font-semibold text-green-900 capitalize">
              Plano {subscription.plan} Ativo
            </h3>
            <p className="text-sm text-green-800">
              {subscription.is_approved_by_admin 
                ? '✅ Sua assinatura foi aprovada e está ativa.'
                : '⏳ Aguardando aprovação do administrador...'}
            </p>
            {subscription.subscription_ends_at && (
              <p className="text-sm text-green-800 mt-1">
                Renova em: {new Date(subscription.subscription_ends_at).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Payment Pending
  if (subscription.status === 'suspended') {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 shrink-0 mt-0.5 text-orange-600" />
          <div className="grow">
            <h3 className="font-semibold text-orange-900">
              Pagamento Pendente
            </h3>
            <p className="text-sm text-orange-800">
              Seu acesso foi suspenso enquanto o pagamento está sendo processado.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
