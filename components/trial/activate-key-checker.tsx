'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Componente que verifica continuamente se:
 * 1. O usuário foi promovido a admin
 * 2. A trial foi ativada/renovada
 * 3. Uma key foi inserida
 * Redireciona automaticamente sem precisar fazer reload/logout
 */
export function ActivateKeyChecker() {
  const router = useRouter()

  const checkStatusAndRedirect = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      if (!token || !userStr) return

      const user = JSON.parse(userStr)

      // Verificar se foi promovido a admin - validar NO BACKEND
      if (user.role === 'admin' || user.role === 'super_admin') {
        try {
          const adminCheckResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/check-admin`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )

          if (adminCheckResponse.ok) {
            const adminData = await adminCheckResponse.json()
            // Se é admin válido e ativo
            if (adminData.data?.is_admin && adminData.data?.is_active) {
              console.log('[ActivateKeyChecker] Admin válido detectado, redirecionando...')
              router.replace('/admin/usuarios')
              return
            }
          }
        } catch (e) {
          console.error('[ActivateKeyChecker] Erro ao validar admin:', e)
        }
        
        // Se falhou a validação admin ou admin foi deativado, continua para verificar trial
      }

      // Verificar se trial foi ativada/renovada (para clinic users ou admins deativados)
      const trialResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/trial/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!trialResponse.ok) {
        if (trialResponse.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.replace('/login')
        }
        return
      }

      const trialData = await trialResponse.json()

      // Se trial está ativa e não expirou
      if (
        trialData.data?.is_active &&
        trialData.data?.status !== 'expired' &&
        (trialData.data?.milliseconds_remaining || 0) > 0
      ) {
        console.log('[ActivateKeyChecker] Trial ativo, redirecionando...')
        router.replace('/dashboard/insights')
        return
      }
    } catch (error) {
      console.error('[ActivateKeyChecker] Erro ao verificar status:', error)
    }
  }, [router])

  // Verificar ao montar
  useEffect(() => {
    checkStatusAndRedirect()
  }, [checkStatusAndRedirect])

  // Verificar a cada 3 segundos (para resposta rápida quando admin ativa a key)
  useEffect(() => {
    const interval = setInterval(() => {
      checkStatusAndRedirect()
    }, 3000)

    return () => clearInterval(interval)
  }, [checkStatusAndRedirect])

  // Verificar quando a aba ganha foco
  useEffect(() => {
    const handleFocus = () => {
      console.log('[ActivateKeyChecker] Aba ganhou foco, verificando...')
      checkStatusAndRedirect()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [checkStatusAndRedirect])

  return null
}
