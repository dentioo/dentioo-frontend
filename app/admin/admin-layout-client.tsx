'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

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

        // Verificar se tem role de admin ou super_admin
        const isSuperAdmin = user.role === 'super_admin'
        const isAdmin = user.role === 'admin'
        
        if (!isAdmin && !isSuperAdmin) {
          router.replace('/planos')
          return
        }

        // Validar se é admin ativo no banco de dados
        const adminCheckResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/check-admin`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        if (!adminCheckResponse.ok) {
          router.replace('/planos')
          return
        }

        const adminData = await adminCheckResponse.json()
        
        if (!adminData.data?.is_admin) {
          router.replace('/planos')
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[AdminLayout] Erro ao verificar autenticação:', error)
        }
        router.replace('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    // Mostrar loading enquanto redireciona
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* PermissionChecker desativado aqui pois o layout já faz verificação completa */}
      {/* <PermissionChecker /> */}
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </>
  )
}

