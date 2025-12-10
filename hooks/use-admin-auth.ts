'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useAdminAuth() {
  const router = useRouter()

  useEffect(() => {
    // Verificar se é admin
    const adminAuth = localStorage.getItem('adminAuth')
    const userAuth = localStorage.getItem('user')

    // Se tem adminAuth, é admin - tudo bem
    if (adminAuth) {
      try {
        const auth = JSON.parse(adminAuth)
        if (auth.role !== 'admin' && auth.role !== 'super_admin') {
          router.replace('/dashboard/insights')
        }
      } catch (e) {
        router.replace('/admin/login')
      }
    } else if (userAuth) {
      // Se tem userAuth mas não é admin, redirecionar
      router.replace('/dashboard/insights')
    } else {
      // Sem nenhuma autenticação, ir para login
      router.replace('/admin/login')
    }
  }, [router])
}
