'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      router.replace('/dashboard/insights')
    }
  }, [router])

  return <SignupForm />
}
