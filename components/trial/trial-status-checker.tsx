'use client'

import { useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'

/**
 * Componente que verifica o status do trial em intervalos
 * Verifica apenas em rotas autenticadas
 */
export function TrialStatusChecker() {
  const router = useRouter()
  const pathname = usePathname()

  // Rotas que NÃO pertencem à área autenticada
  const publicRoutes = [
    '/login',
    '/signup',
    '/home',
    '/planos',
    '/confirmar-pagamento',
    '/termos',
    '/privacidade',
    '/trial-expirado',
  ]

  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route))
  const isAdminRoute = pathname?.startsWith('/admin')

  const checkTrialStatus = useCallback(async () => {
    // Não verificar em rotas públicas ou admin
    if (isPublicRoute || isAdminRoute) return

    try {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (!token || !user) return

      // Verificar se é admin/super_admin - se for, libera acesso
      try {
        const userData = JSON.parse(user)
        if (userData.role === 'admin' || userData.role === 'super_admin') {
          return // Admins não precisam validar trial
        }
      } catch (e) {
        // Continuar com verificação
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/trial/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.replace('/login')
        }
        return
      }

      const data = await response.json()

      // Se trial não está ativo ou expirou
      if (!data.data?.is_active || data.data?.status === 'expired') {
        router.replace('/planos')
        return
      }

      // Se não tem tempo restante
      const msRemaining = data.data?.milliseconds_remaining || 0
      if (msRemaining <= 0) {
        router.replace('/planos')
      }
    } catch (error) {
      console.error('Erro ao verificar trial status:', error)
    }
  }, [isPublicRoute, isAdminRoute, router])

  // Verificar trial ao montar (com delay para não conflitar com DashboardGuard)
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      checkTrialStatus()
    }, 5000) // 5 segundos de delay

    return () => clearTimeout(initialTimer)
  }, [checkTrialStatus])

  // Verificar a cada 60 segundos
  useEffect(() => {
    if (isPublicRoute || isAdminRoute) return

    const interval = setInterval(() => {
      checkTrialStatus()
    }, 60000) // 60 segundos

    return () => clearInterval(interval)
  }, [checkTrialStatus, isPublicRoute, isAdminRoute])

  // Verificar quando a aba ganha foco
  useEffect(() => {
    const handleFocus = () => {
      checkTrialStatus()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [checkTrialStatus])

  return null
}
