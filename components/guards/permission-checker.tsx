'use client'

import { useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface PermissionCheckResult {
  isAdmin: boolean
  isSuperAdmin: boolean
  hasActiveTrial: boolean
  isValid: boolean
}

/**
 * Componente que verifica permissões a cada 3 segundos
 * Detecta mudanças de role ou status de trial e redireciona automaticamente
 */
export function PermissionChecker() {
  const router = useRouter()
  const pathname = usePathname()

  const checkPermissions = useCallback(async (): Promise<PermissionCheckResult> => {
    try {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      if (!token || !userStr) {
        return {
          isAdmin: false,
          isSuperAdmin: false,
          hasActiveTrial: false,
          isValid: false,
        }
      }

      const user = JSON.parse(userStr)
      const isAdmin = user.role === 'admin'
      const isSuperAdmin = user.role === 'super_admin'

      // Se é admin ou super_admin, validar APENAS no backend e liberar sem verificar trial
      if (isAdmin || isSuperAdmin) {
        try {
          const adminCheckResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/check-admin`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )

          if (adminCheckResponse.ok) {
            const adminData = await adminCheckResponse.json()
            if (adminData.data?.is_admin) {
              // Admin é válido, pode acessar tudo (dashboard + admin)
              return {
                isAdmin,
                isSuperAdmin,
                hasActiveTrial: false,
                isValid: true,
              }
            }
          }
          // Se falhar a validação admin, NÃO continua com trial
          // Apenas retorna inválido
          return {
            isAdmin: false,
            isSuperAdmin: false,
            hasActiveTrial: false,
            isValid: false,
          }
        } catch (e) {
          console.error('[PermissionChecker] Erro ao validar admin:', e)
          return {
            isAdmin: false,
            isSuperAdmin: false,
            hasActiveTrial: false,
            isValid: false,
          }
        }
      }

      // Para clinic users, verificar trial
      try {
        const trialResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/trial/status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        if (trialResponse.ok) {
          const trialData = await trialResponse.json()
          const hasActiveTrial =
            trialData.data?.is_active &&
            trialData.data?.status !== 'expired' &&
            (trialData.data?.milliseconds_remaining || 0) > 0

          return {
            isAdmin: false,
            isSuperAdmin: false,
            hasActiveTrial,
            isValid: hasActiveTrial,
          }
        }
      } catch (e) {
        console.error('[PermissionChecker] Erro ao verificar trial:', e)
      }

      return {
        isAdmin: false,
        isSuperAdmin: false,
        hasActiveTrial: false,
        isValid: false,
      }
    } catch (error) {
      console.error('[PermissionChecker] Erro geral:', error)
      return {
        isAdmin: false,
        isSuperAdmin: false,
        hasActiveTrial: false,
        isValid: false,
      }
    }
  }, [])

  // Verificar permissões a cada 3 segundos
  useEffect(() => {
    const interval = setInterval(async () => {
      const permissions = await checkPermissions()

      // Se está em /admin mas não é mais admin
      if (pathname?.startsWith('/admin')) {
        if (!permissions.isAdmin && !permissions.isSuperAdmin) {
          console.log('[PermissionChecker] Admin perdeu permissão, redirecionando...')
          router.replace('/planos')
          return
        }
      }

      // Se está em /dashboard mas não tem permissão válida (não deve acontecer, mas por segurança)
      if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/(authenticated)')) {
        console.log('[PermissionChecker] Admin em rota dashboard detectado, redirecionando...')
        router.replace('/admin/usuarios')
        return
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [pathname, checkPermissions, router])

  return null
}
