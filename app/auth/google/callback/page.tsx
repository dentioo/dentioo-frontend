'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

function GoogleAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processando autenticação...')
  const hasProcessed = useRef(false)

  useEffect(() => {
    // Prevenir múltiplas execuções
    if (hasProcessed.current) return
    hasProcessed.current = true

    const token = searchParams.get('token')
    const refreshToken = searchParams.get('refreshToken')
    const userId = searchParams.get('userId')
    const error = searchParams.get('error')

    if (error) {
      setStatus('error')
      setMessage(error)
      setTimeout(() => {
        router.replace('/login')
      }, 3000)
      return
    }

    if (token && userId) {
      // Salvar tokens no localStorage
      localStorage.setItem('token', token)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }

      // Buscar dados do usuário
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }
          return res.json()
        })
        .then((data) => {
          // O backend retorna { success: true, data: { user: {...} } }
          const user = data.data?.user || data.data || data.user
          
          if (data.success && user) {
            // Formatar dados do usuário no formato esperado
            const userData = {
              id: user.id,
              email: user.email,
              fullName: user.fullName || user.full_name,
              full_name: user.full_name || user.fullName,
              clinicName: user.clinicName || user.clinic_name,
              clinic_name: user.clinic_name || user.clinicName,
              clinic_email: user.email,
              clinic_phone: user.phone || user.clinic_phone,
              clinic_address: user.clinic_address,
              clinic_city: user.clinic_city,
              clinic_state: user.clinic_state,
              clinic_cnpj: user.clinic_cnpj,
              opening_hours: user.opening_hours,
              closing_hours: user.closing_hours,
              verified: user.verified,
              role: user.role || 'clinic', // Garantir que role seja preservado
            }
            
            localStorage.setItem('user', JSON.stringify(userData))
            
            // Verificar se é admin
            if (userData.role === 'admin' || userData.role === 'super_admin') {
              setStatus('success')
              setMessage('Login realizado com sucesso!')
              setTimeout(() => {
                router.replace('/admin/usuarios')
              }, 1000)
              return
            }

            // Verificar status do plano/trial
            fetch(`${apiUrl}/api/trial/status`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
              .then((res) => {
                if (!res.ok) {
                  // Se não conseguir verificar, redireciona para planos
                  setStatus('success')
                  setMessage('Login realizado com sucesso!')
                  setTimeout(() => {
                    router.replace('/planos')
                  }, 1000)
                  return null
                }
                return res.json()
              })
              .then((statusData) => {
                if (!statusData) return // Já redirecionou
                
                const subscription = statusData.data?.subscription
                const isActive = statusData.data?.is_active || (subscription?.status === 'active' && subscription?.plan !== 'free')
                
                setStatus('success')
                setMessage('Login realizado com sucesso!')
                
                if (isActive) {
                  setTimeout(() => {
                    router.replace('/dashboard/insights')
                  }, 1000)
                } else {
                  setTimeout(() => {
                    router.replace('/planos')
                  }, 1000)
                }
              })
              .catch(() => {
                // Em caso de erro, redireciona para planos
                setStatus('success')
                setMessage('Login realizado com sucesso!')
                setTimeout(() => {
                  router.replace('/planos')
                }, 1000)
              })
          } else {
            setStatus('error')
            setMessage('Erro ao obter dados do usuário')
            setTimeout(() => {
              router.replace('/login')
            }, 3000)
          }
        })
        .catch((err) => {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching user data:', err)
          }
          setStatus('error')
          setMessage('Erro ao processar autenticação. Verifique se o servidor está rodando.')
          setTimeout(() => {
            router.replace('/login')
          }, 3000)
        })
    } else {
      setStatus('error')
      setMessage('Token não recebido')
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Autenticando...</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sucesso!</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecionando para o login...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function GoogleAuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Carregando...</h2>
          <p className="text-gray-600">Processando autenticação...</p>
        </div>
      </div>
    }>
      <GoogleAuthCallbackContent />
    </Suspense>
  )
}

