'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'super_admin'
}

export function AdminGuard({ children, requiredRole = 'admin' }: AdminGuardProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem('user')
        
        if (!userStr) {
          router.replace('/login')
          return
        }

        const user = JSON.parse(userStr)

        // Verificar se tem role de admin
        if (user.role !== 'admin' && user.role !== 'super_admin') {
          router.replace('/dashboard/insights')
          return
        }

        // Se super_admin é requerido, verificar
        if (requiredRole === 'super_admin' && user.role !== 'super_admin') {
          router.replace('/dashboard/insights')
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        router.replace('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
