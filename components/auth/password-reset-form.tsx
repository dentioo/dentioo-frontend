"use client"

import type React from "react"
import { useState } from "react"
import { Mail, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"

export function PasswordResetForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Even if there's an error, show success to prevent email enumeration
        setSubmitted(true)
        return
      }

      setSubmitted(true)
    } catch (err) {
      console.error('Error requesting password reset:', err)
      // Show success anyway to prevent email enumeration
      setSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8 flex flex-col justify-center h-full max-w-md mx-auto">
        {/* Success Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-in zoom-in duration-500">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-ping"></div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Email enviado!
        </h2>

        {/* Main Message */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-4 border border-blue-100">
          <p className="text-gray-700 leading-relaxed font-medium">
            Verifique sua caixa de entrada e clique no link para recuperar sua senha.
          </p>
        </div>

        {/* Spam Warning */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 text-left">
            <span className="font-semibold">Não recebeu?</span> Verifique sua pasta de spam.
          </p>
        </div>

        {/* Back Button */}
        <a 
          href="/login" 
          className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl py-4 px-8 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <span>Voltar ao login</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-2 flex flex-col justify-center">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-color-primary mb-2">Recuperar Senha</h1>
        <p className="text-gray-600">Digite seu email e enviaremos instruções para recuperar sua senha</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 w-full">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
            Email
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Mail className="text-gray-400" size={20} />
            </div>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Enviando...
            </span>
          ) : (
            "Enviar instruções"
          )}
        </button>
      </form>

      <p className="text-center text-gray-600 mt-2">
        Lembrou sua senha? <a className="font-semibold text-color-primary hover:text-color-primary-light transition" href="/login">Volte ao login</a>
      </p>
    </div>
  )
}
