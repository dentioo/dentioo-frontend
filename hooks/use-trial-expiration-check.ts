'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface UseTrialExpirationCheckProps {
  millisecondsRemaining: number | null | undefined
  isActive: boolean | null | undefined
  checkInterval?: number // Intervalo em ms para verificar (padrão: 5000ms)
}

/**
 * Hook que verifica automaticamente se o trial expirou quando o timer chega a zero
 * e redireciona o usuário se necessário
 */
export function useTrialExpirationCheck({
  millisecondsRemaining,
  isActive,
  checkInterval = 5000,
}: UseTrialExpirationCheckProps) {
  const router = useRouter()
  const hasCheckedRef = useRef(false)

  useEffect(() => {
    // Se não tem tempo restante ou não está ativo, verificar imediatamente
    if (millisecondsRemaining === null || millisecondsRemaining === undefined || millisecondsRemaining <= 0) {
      if (!hasCheckedRef.current) {
        hasCheckedRef.current = true
        checkTrialStatus()
      }
      return
    }

    // Resetar flag quando há tempo restante
    hasCheckedRef.current = false

    // Calcular quando o timer vai zerar
    const timeUntilZero = millisecondsRemaining

    // Se o tempo já zerou, verificar imediatamente
    if (timeUntilZero <= 0) {
      checkTrialStatus()
      return
    }

    // Configurar timeout para verificar quando o timer zerar
    const timeoutId = setTimeout(() => {
      checkTrialStatus()
    }, timeUntilZero)

    // Também verificar periodicamente enquanto está ativo
    const intervalId = setInterval(() => {
      checkTrialStatus()
    }, checkInterval)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [millisecondsRemaining, isActive, checkInterval])

  const checkTrialStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/trial/status`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.replace('/login')
        }
        return
      }

      const data = await response.json()
      const isStillActive = data.data?.is_active || (data.data?.subscription?.status === 'active' && data.data?.subscription?.plan !== 'free')
      const status = data.data?.subscription?.status || data.data?.status

      // Se não está mais ativo ou expirou, redirecionar
      if (!isStillActive || status === 'expired') {
        // Disparar evento para atualizar outros componentes
        window.dispatchEvent(new CustomEvent('trial-expired'))
        
        // Redirecionar para planos
        router.replace('/planos')
      }
    } catch (error) {
      console.error('Erro ao verificar status do trial:', error)
    }
  }
}

