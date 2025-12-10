'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        
        if (!token || !userStr) {
          router.replace('/login')
          return
        }

        const user = JSON.parse(userStr)

        // Super admin pode acessar dashboard
        if (user.role === 'super_admin') {
          setIsAuthorized(true)
          setIsChecking(false)
          return
        }

        // Admins normais devem usar /admin, não /dashboard
        if (user.role === 'admin') {
          router.replace('/admin/usuarios')
          return
        }

        // Para clinic users, verificar se trial está ativo
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/trial/status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            router.replace('/login')
          } else {
            router.replace('/planos')
          }
          setIsChecking(false)
          return
        }

        const data = await response.json()
        
        // Verificação robusta do trial ativo
        // A API pode retornar dados em data.data.subscription ou diretamente em data.data
        const subscription = data.data?.subscription || data.data
        const millisecondsRemaining = subscription?.milliseconds_remaining || data.data?.milliseconds_remaining || 0
        const plan = subscription?.plan || data.data?.plan_type || 'free'
        const status = subscription?.status || data.data?.status || 'inactive'
        const isActive = subscription?.is_active !== undefined ? subscription.is_active : data.data?.is_active
        
        // Verificar se tem trial/key ativa
        const hasActiveTrial = 
          isActive === true &&
          status !== 'expired' &&
          (
            // Para trials: precisa ter tempo restante
            (plan === 'trial' && millisecondsRemaining > 0) ||
            // Para planos pagos: status active e plan diferente de free
            (plan !== 'free' && plan !== 'trial' && status === 'active')
          )
        
        if (hasActiveTrial) {
          setIsAuthorized(true)
        } else {
          router.replace('/planos')
        }
        
        setIsChecking(false)
      } catch (error) {
        console.error('[AuthenticatedLayout] Erro ao verificar autenticação:', error)
        router.replace('/planos')
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [router])

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    // Mostrar loading enquanto redireciona
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </>
  )
}
