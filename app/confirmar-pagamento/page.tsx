'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ConfirmarPagamentoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleGoToDashboard = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      // Verificar se tem chave ativa
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/trial/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        router.push('/planos')
        return
      }

      const data = await response.json()
      const subscription = data.data?.subscription

      if (subscription?.status === 'active') {
        router.push('/dashboard/insights')
      } else {
        router.push('/planos')
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao verificar status:', err)
      }
      router.push('/planos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Confirmado!</h1>
          <p className="text-gray-600">Sua assinatura foi ativada com sucesso.</p>
        </div>
        
        <button
          onClick={handleGoToDashboard}
          disabled={loading}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? 'Verificando...' : 'Ir para o Dashboard'}
        </button>
      </div>
    </div>
  )
}
