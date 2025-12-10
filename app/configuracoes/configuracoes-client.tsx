'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'
import { PageHeader } from "@/components/ui/page-header"
import { SettingsForm } from "@/components/settings/settings-form"

const SIDEBAR_STORAGE_KEY = "dentioo_sidebar_open"

export function ConfiguracoesPageClient() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  
  // Carregar estado inicial do localStorage (padrão: true/aberta)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY)
      return saved !== null ? saved === "true" : true // Padrão: aberta
    }
    return true
  })

  // Salvar no localStorage sempre que o estado mudar
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarOpen))
    }
  }, [sidebarOpen])

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

        // Admins podem acessar configurações
        if (user.role === 'admin' || user.role === 'super_admin') {
          setIsAuthorized(true)
          setIsChecking(false)
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
          }
          return
        }

        // Clinic users podem acessar configurações mesmo sem trial ativo
        setIsAuthorized(true)
        setIsChecking(false)
      } catch (error) {
        console.error('[ConfiguracoesPage] Erro ao verificar autenticação:', error)
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
    return null
  }

  return (
    <div className="flex flex-col h-screen bg-color-bg-light overflow-hidden">
      {/* MVP Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white text-center py-2 px-4 text-xs sm:text-sm font-medium">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 max-w-[100rem] mx-auto">
          <span className="inline-flex items-center gap-1.5">
            <span>Este produto se encontra em fase de testes</span>
            <span className="font-mono text-xs">{"</>"}</span>
          </span>
          <span className="hidden sm:inline opacity-75">|</span>
          <span className="opacity-90">Para mais informações consulte o desenvolvedor</span>
        </div>
      </div>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 transition-all duration-300 ease-in-out">
          <div className="flex-1 space-y-4">
            <PageHeader
              title="Configurações"
              description="Gerencie as configurações da sua clínica"
            />
            <SettingsForm />
          </div>
        </main>
      </div>
    </div>
  )
}

