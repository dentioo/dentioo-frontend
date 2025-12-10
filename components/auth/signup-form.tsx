"use client"

import type React from "react"
import { useState } from "react"
import { User, Mail, Lock, Building2, Eye, EyeOff } from "lucide-react"

export function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    clinicName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  const handleGoogleSignup = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/auth/google?action=signup`)
      const data = await response.json()
      
      if (data.success && data.authUrl) {
        window.location.href = data.authUrl
      } else {
        setError('Erro ao iniciar autenticação com Google')
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não conferem")
      return
    }

    setIsLoading(true)

    try {
      // Monta o payload com fullName
      const payload = {
        fullName: formData.name,
        clinicName: formData.clinicName,
        email: formData.email,
        password: formData.password,
        // phone: '', // Adicione se quiser coletar telefone
      }
      // Chamada real para a API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const data = await response.json()
        setError(data.message || 'Erro ao criar conta. Tente novamente.')
        return
      }
      setSuccess(true)
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-color-success bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-color-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-color-primary mb-2">Conta criada com sucesso!</h2>
        <p className="text-gray-600 mb-6">Um email de confirmação foi enviado para {formData.email}</p>
        <a href="/login" className="bg-color-primary-light hover:bg-[#0d2847] text-white font-semibold rounded-lg py-3 px-8 inline-block transition-colors duration-300">
          Ir para o login
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-2 w-[480px] flex flex-col mt-16">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-color-primary mb-2">Comece agora</h1>
        <p className="text-gray-600">14 dias de teste grátis, sem cartão de crédito</p>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignup}
        className="w-full py-3 px-4 border border-color-neutral-light rounded-lg font-medium text-color-primary hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
        </svg>
        Google
      </button>

      <div className="relative mb-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Ou</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 w-full">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
            Seu nome
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <User className="text-gray-400" size={20} />
            </div>
            <input
              id="name"
              name="name"
              placeholder="Pedro Henrique"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="clinicName" className="block text-sm font-semibold text-gray-900 mb-2">
            Nome da Clínica
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Building2 className="text-gray-400" size={20} />
            </div>
            <input
              id="clinicName"
              name="clinicName"
              placeholder="Clínica Dental Fonseca"
              value={formData.clinicName}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              required
            />
          </div>
        </div>

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
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
            Senha
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Lock className="text-gray-400" size={20} />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
            Confirmar Senha
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Lock className="text-gray-400" size={20} />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-3 my-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <input
            type="checkbox"
            id="agree"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            required
            className="w-5 h-5 rounded border-2 border-gray-300 cursor-pointer mt-0.5 focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="agree" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
            Concordo com os{' '}
            <a href="/termos" className="font-semibold text-blue-600 hover:text-blue-700 transition underline">
              Termos de Serviço
            </a>
            {' '}e{' '}
            <a href="/privacidade" className="font-semibold text-blue-600 hover:text-blue-700 transition underline">
              Política de Privacidade
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.name || !formData.clinicName || !formData.email || !formData.password || !formData.confirmPassword || !agreeTerms}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Criando conta...
            </span>
          ) : (
            "Criar conta grátis"
          )}
        </button>
      </form>

      <p className="text-center text-gray-600 mt-2 mb-8">
        Já tem conta? <a className="font-semibold text-color-primary hover:text-color-primary-light transition" href="/login">Entre aqui</a>
      </p>
    </div>
  )
}
