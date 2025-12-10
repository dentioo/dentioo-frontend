'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ActivateTrialKeyProps {
  onSuccess?: () => void
}

export default function ActivateTrialKey({ onSuccess }: ActivateTrialKeyProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [keyCode, setKeyCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Obter email do usuário logado do localStorage
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setEmail(user.email || user.clinic_email || '')
      } catch (err) {
        console.error('Erro ao parsear usuário:', err)
      }
    }
  }, [])

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/trial/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, keyCode: keyCode.toUpperCase() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Erro ao ativar chave')
        setLoading(false)
        return
      }

      setSuccess(true)
      if (onSuccess) {
        setTimeout(() => onSuccess(), 2000)
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor')
      console.error(err)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chave Ativada!</h2>
          <p className="text-gray-600 mb-6">Seu teste de 14 dias foi iniciado com sucesso.</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              Você tem acesso completo até <strong>14 de dezembro</strong>
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium transition"
          >
            Ir para Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex items-center justify-center p-4">
      <div className="w-full">
        <div className="bg-white rounded-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Ativar Teste Grátis</h1>
            <p className="text-gray-600 text-sm mt-2">Insira a chave que recebeu por email</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleActivate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                disabled
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Código da Chave</label>
              <input
                type="text"
                value={keyCode}
                onChange={(e) => setKeyCode(e.target.value.toUpperCase())}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center tracking-widest"
                placeholder="TRIAL-2025-XXXX"
              />
              <p className="text-xs text-gray-500 mt-2">
                Formato: TRIAL-XXXX-XXXX
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Ativando...' : 'Ativar Chave'}
            </button>

            <a 
              href="https://wa.me/5534998731732?text=Olá! Gostaria de solicitar uma chave de ativação do Dentioo." 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-.355.228-.69.495-.99.795C4.189 10.446 2 14.301 2 18.353c0 2.537.798 4.943 2.279 6.868l-2.424 7.378S4.57 20.073 6.362 15.923c1.458 1.159 3.287 1.865 5.255 1.865 9.052 0 9.52-8.379 9.52-9.397 0-4.355-3.288-8.335-7.923-8.335 0-.595 0-1.189-.074-1.779z"/>
              </svg>
              Solicitar Chave via WhatsApp
            </a>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Como funciona</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ 14 dias de teste grátis</li>
            <li>✅ Acesso completo a todas as funcionalidades</li>
            <li>✅ Sem cartão de crédito necessário</li>
            <li>✅ Cancele a qualquer momento</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
