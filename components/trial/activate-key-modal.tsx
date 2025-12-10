'use client'

import { useState } from 'react'
import { X, Loader } from 'lucide-react'
import { useActivateKeyModal } from '@/contexts/activate-key-modal'

interface ActivateKeyModalProps {
  onSuccess?: () => void
}

export function ActivateKeyModal({ onSuccess }: ActivateKeyModalProps) {
  const { isOpen, closeModal } = useActivateKeyModal()
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [activationData, setActivationData] = useState<{ planType: string; days: number } | null>(null)

  const handleActivate = async () => {
    if (!key.trim()) {
      setError('Digite uma chave de teste')
      return
    }

    // Obter email do usuário logado
    const userStr = localStorage.getItem('user')
    let email = ''
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        email = user.email || user.clinic_email || ''
      } catch (err) {
        console.error('Erro ao parsear usuário:', err)
      }
    }

    if (!email) {
      setError('Email não encontrado. Faça login novamente.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/trial/activate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email: email,
            keyCode: key.trim().toUpperCase()
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Erro ao ativar chave')
        setLoading(false)
        return
      }

      // Armazenar dados da ativação para exibir
      const planTypeName = data.data?.subscription?.plan_type_name || 'Free Trial'
      const totalDays = data.data?.subscription?.total_days || 0
      
      setActivationData({ planType: planTypeName, days: totalDays })
      setSuccess(true)
      setKey('')
      
      // Disparar evento customizado para atualizar componentes
      window.dispatchEvent(new CustomEvent('trial-activated', { 
        detail: { planType: planTypeName, days: totalDays } 
      }))
      
      setTimeout(() => {
        onSuccess?.()
        closeModal()
        setSuccess(false)
        // Recarregar a página para atualizar o status
        window.location.reload()
      }, 3000)
    } catch (err) {
      setError('Erro ao ativar chave. Tente novamente.')
      console.error(err)
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 backdrop-blur-sm z-40 transition-opacity"
        onClick={closeModal}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Ativar Chave</h2>
            <button
              onClick={closeModal}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {success ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-green-600 font-medium mb-2">Chave ativada com sucesso!</p>
              {activationData && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-blue-900">{activationData.planType}</span> ativado
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Duração: <span className="font-semibold">{activationData.days} {activationData.days === 1 ? 'dia' : 'dias'}</span>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Description */}
              <p className="text-gray-600 text-sm mb-6">
                Digite sua chave de teste para ativar seu acesso gratuito
              </p>

              {/* Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chave de Teste
                </label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value)
                    setError(null)
                  }}
                  placeholder="Insira sua chave aqui"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    error
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={loading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleActivate}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Ativando...
                    </>
                  ) : (
                    'Ativar'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  )
}
