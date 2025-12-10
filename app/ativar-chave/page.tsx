'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AtivarChavePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para /planos onde a chave pode ser ativada via modal na sidebar
    router.replace('/planos')
  }, [router])

  return null
}
