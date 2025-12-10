'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Home, LayoutGrid, DollarSign } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [redirectPath, setRedirectPath] = useState<string | null>(null)

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        // Verificar se está logado
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        
        if (!token) {
          // Não logado → /home
          setRedirectPath('/home')
          router.replace('/home')
          return
        }

        // Verificar status do plano
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const response = await fetch(`${apiUrl}/api/trial/status`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          // Se token inválido, limpar e ir para /home
          if (response.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setRedirectPath('/home')
            router.replace('/home')
            return
          }
          // Em caso de erro, assumir sem plano
          setRedirectPath('/planos')
          router.replace('/planos')
          return
        }

        const data = await response.json()
        const isActive = data.data?.is_active === true
        const planName = data.data?.plan_name || data.data?.subscription?.plan_name || 'free'
        const status = data.data?.status || data.data?.subscription?.status || 'expired'

        // Verificar se tem plano ativo (trial ativo ou plano pago ativo)
        const hasActivePlan = isActive || (status === 'active' && planName !== 'free')

        if (hasActivePlan) {
          // Logado com plano → /dashboard/insights
          setRedirectPath('/dashboard/insights')
          router.replace('/dashboard/insights')
        } else {
          // Logado sem plano → /planos
          setRedirectPath('/planos')
          router.replace('/planos')
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error)
        // Em caso de erro, verificar se tem token
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        if (token) {
          setRedirectPath('/planos')
          router.replace('/planos')
        } else {
          setRedirectPath('/home')
          router.replace('/home')
        }
      } finally {
        setIsChecking(false)
      }
    }

    checkAndRedirect()
  }, [router])

  // Mostrar loading enquanto verifica
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Redirecionando...</p>
        </div>
      </div>
    )
  }

  // Mostrar mensagem enquanto redireciona
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
        <div className="inline-block p-4 bg-yellow-100 rounded-full mb-6">
          <AlertCircle className="w-12 h-12 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Página não encontrada</h1>
        <p className="text-gray-600 mb-6">
          A página que você está procurando não existe.
        </p>
        <div className="space-y-3">
          {redirectPath === '/dashboard/insights' && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <LayoutGrid className="w-4 h-4" />
              <span>Redirecionando para o dashboard...</span>
            </div>
          )}
          {redirectPath === '/planos' && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>Redirecionando para os planos...</span>
            </div>
          )}
          {redirectPath === '/home' && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Home className="w-4 h-4" />
              <span>Redirecionando para a página inicial...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

