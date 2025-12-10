'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  const router = useRouter()
  const pathname = usePathname()
  const hasChecked = useRef(false)

  useEffect(() => {
    // Prevenir múltiplas verificações
    if (hasChecked.current) return
    hasChecked.current = true

    // Não redirecionar se estiver na página de callback do Google
    if (pathname?.includes('/auth/google/callback')) {
      return
    }

    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        // Se for admin, redireciona para admin
        if (user.role === 'admin' || user.role === 'super_admin') {
          router.replace('/admin/usuarios')
          return
        }
        // Caso contrário, verifica trial/subscription
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        fetch(`${apiUrl}/api/trial/status`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => {
            if (res.ok) {
              return res.json()
            }
            return null
          })
          .then((data) => {
            if (data) {
              const subscription = data.data?.subscription
              const isActive = data.data?.is_active || (subscription?.status === 'active' && subscription?.plan !== 'free')
              if (isActive) {
                router.replace('/dashboard/insights')
              } else {
                router.replace('/planos')
              }
            } else {
              router.replace('/planos')
            }
          })
          .catch(() => {
            router.replace('/planos')
          })
      } catch {
        // Se houver erro ao parsear user, não redireciona
      }
    }
  }, [router, pathname])

  return <LoginForm />
}
