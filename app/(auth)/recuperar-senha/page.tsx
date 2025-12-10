'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PasswordResetForm } from "@/components/auth/password-reset-form"

function PasswordResetContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    const authToken = localStorage.getItem('token')
    if (authToken) {
      router.replace('/dashboard/insights')
      return
    }

    // Se houver token na URL, redirecionar para a página de reset
    if (token) {
      router.replace(`/recuperar-senha/reset?token=${token}`)
    }
  }, [router, token])

  return <PasswordResetForm />
}

export default function PasswordResetPage() {
  return (
    <Suspense fallback={<PasswordResetForm />}>
      <PasswordResetContent />
    </Suspense>
  )
}
