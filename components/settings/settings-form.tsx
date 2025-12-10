"use client"

import { useState, useEffect } from "react"
import { Save, Loader2, Lock, Eye, EyeOff, Mail } from "lucide-react"
import { useRouter } from "next/navigation"

interface ClinicData {
  id: string
  clinic_name: string
  clinic_email: string
  clinic_phone: string
  clinic_address: string
  clinic_city: string
  clinic_state: string
  clinic_cnpj?: string
  opening_hours?: string
  closing_hours?: string
}

export function SettingsForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<ClinicData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Estados para alteração de senha
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [sendingResetEmail, setSendingResetEmail] = useState(false)

  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        const token = localStorage.getItem("token")
        const userStr = localStorage.getItem("user")

        if (!token) {
          router.replace("/login")
          return
        }

        // Try to fetch clinic data from user endpoint
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const response = await fetch(`${apiUrl}/api/user/clinic`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            router.replace("/login")
            return
          }
          // If endpoint doesn't exist, use data from localStorage
          if (userStr) {
            const user = JSON.parse(userStr)
            const clinicData: ClinicData = {
              id: user.id || "",
              clinic_name: user.clinic_name || "Minha Clínica",
              clinic_email: user.clinic_email || "contato@clinica.com.br",
              clinic_phone: user.clinic_phone || "(11) 3000-0000",
              clinic_address: user.clinic_address || "Rua Principal",
              clinic_city: user.clinic_city || "São Paulo",
              clinic_state: user.clinic_state || "SP",
              clinic_cnpj: user.clinic_cnpj || "",
              opening_hours: user.opening_hours || "08:00",
              closing_hours: user.closing_hours || "18:00",
            }
            setFormData(clinicData)
            setLoading(false)
            return
          }
          throw new Error("Erro ao carregar dados da clínica")
        }

        const result = await response.json()
        if (process.env.NODE_ENV === 'development') {
          console.log("Dados recebidos do backend:", result.data)
        }
        setFormData(result.data || null)
        setLoading(false)
      } catch (err) {
        console.error("Erro ao carregar dados:", err)
        // Fallback to localStorage data
        const userStr = localStorage.getItem("user")
        if (userStr) {
          const user = JSON.parse(userStr)
          const clinicData: ClinicData = {
            id: user.id || "",
            clinic_name: user.clinic_name || "Minha Clínica",
            clinic_email: user.clinic_email || "contato@clinica.com.br",
            clinic_phone: user.clinic_phone || "(11) 3000-0000",
            clinic_address: user.clinic_address || "Rua Principal",
            clinic_city: user.clinic_city || "São Paulo",
            clinic_state: user.clinic_state || "SP",
            clinic_cnpj: user.clinic_cnpj || "",
            opening_hours: user.opening_hours || "08:00",
            closing_hours: user.closing_hours || "18:00",
          }
          setFormData(clinicData)
        }
        setLoading(false)
      }
    }

    fetchClinicData()
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData) return

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/user/clinic`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.replace("/login")
          return
        }
        throw new Error("Erro ao salvar dados da clínica")
      }

      const result = await response.json()

      // Update localStorage with new clinic data
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const user = JSON.parse(userStr)
        const updatedUser = {
          ...user,
          clinic_name: formData.clinic_name,
          clinic_email: formData.clinic_email,
          clinic_phone: formData.clinic_phone,
          clinic_address: formData.clinic_address,
          clinic_city: formData.clinic_city,
          clinic_state: formData.clinic_state,
          clinic_cnpj: formData.clinic_cnpj,
          opening_hours: formData.opening_hours,
          closing_hours: formData.closing_hours,
        }
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }

      setSuccess("Dados da clínica atualizados com sucesso!")
      setSaving(false)
    } catch (err) {
      console.error("Erro ao salvar dados:", err)
      setError("Erro ao salvar dados da clínica")
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    // Format Telefone: (XX) XXXXX-XXXX
    if (name === "clinic_phone") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .substring(0, 15)
    }

    // Format CNPJ: XX.XXX.XXX/XXXX-XX
    if (name === "clinic_cnpj") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .substring(0, 18)
    }

    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [name]: formattedValue,
          }
        : null
    )
  }

  const handleChangePassword = async () => {
    setPasswordError("")
    setPasswordSuccess("")

    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem")
      return
    }

    if (newPassword.length < 8) {
      setPasswordError("A senha deve ter no mínimo 8 caracteres")
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError("A senha deve conter pelo menos uma letra maiúscula")
      return
    }

    if (!/[0-9]/.test(newPassword)) {
      setPasswordError("A senha deve conter pelo menos um número")
      return
    }

    if (!/[!@#$%^&*]/.test(newPassword)) {
      setPasswordError("A senha deve conter pelo menos um caractere especial (!@#$%^&*)")
      return
    }

    setChangingPassword(true)

    try {
      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

      const response = await fetch(`${apiUrl}/api/auth/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setPasswordError(result.message || "Erro ao alterar senha")
        return
      }

      setPasswordSuccess("Senha alterada com sucesso!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setShowPasswordSection(false)
    } catch (err) {
      console.error("Erro ao alterar senha:", err)
      setPasswordError("Erro ao alterar senha. Tente novamente.")
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSendResetEmail = async () => {
    setPasswordError("")
    setPasswordSuccess("")
    setSendingResetEmail(true)

    try {
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        setPasswordError("Erro ao obter email do usuário")
        return
      }

      const user = JSON.parse(userStr)
      const email = user.email || user.clinic_email

      if (!email) {
        setPasswordError("Email não encontrado")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        setPasswordError(result.message || "Erro ao enviar email de recuperação")
        return
      }

      setPasswordSuccess("Email de recuperação enviado! Verifique sua caixa de entrada.")
    } catch (err) {
      console.error("Erro ao enviar email:", err)
      setPasswordError("Erro ao enviar email. Tente novamente.")
    } finally {
      setSendingResetEmail(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 font-medium">Erro ao carregar configurações</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-color-neutral-light overflow-hidden">
        <div className="p-6 border-b border-color-neutral-light">
          <h2 className="text-xl font-semibold text-color-primary">Dados da Clínica</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {/* Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Clínica</label>
              <input
                type="text"
                name="clinic_name"
                value={formData.clinic_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
              <input
                type="email"
                name="clinic_email"
                value={formData.clinic_email}
                readOnly
                disabled
                className="w-full px-4 py-2 border border-color-neutral-light rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                title="O e-mail não pode ser alterado"
              />
            </div>
          </div>

          {/* Phone and CNPJ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <input
                type="tel"
                name="clinic_phone"
                value={formData.clinic_phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
              <input
                type="text"
                name="clinic_cnpj"
                value={formData.clinic_cnpj}
                onChange={handleChange}
                placeholder="00.000.000/0000-00"
                className="w-full px-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
            <input
              type="text"
              name="clinic_address"
              value={formData.clinic_address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light"
            />
          </div>

          {/* City and State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
              <input
                type="text"
                name="clinic_city"
                value={formData.clinic_city}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <input
                type="text"
                name="clinic_state"
                value={formData.clinic_state}
                onChange={handleChange}
                maxLength={2}
                className="w-full px-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light"
              />
            </div>
          </div>

          {/* Opening and Closing Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Horário de Abertura</label>
              <input
                type="time"
                name="opening_hours"
                value={formData.opening_hours}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Horário de Fechamento</label>
              <input
                type="time"
                name="closing_hours"
                value={formData.closing_hours}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Seção de Alteração de Senha */}
      <div className="bg-white rounded-xl shadow-sm border border-color-neutral-light overflow-hidden">
        <div className="p-6 border-b border-color-neutral-light">
          <h2 className="text-xl font-semibold text-color-primary">Alterar Senha</h2>
          <p className="text-sm text-gray-600 mt-1">Altere sua senha ou solicite um link de recuperação por email</p>
        </div>

        <div className="p-6 space-y-4">
          {passwordError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{passwordError}</p>
            </div>
          )}

          {passwordSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">{passwordSuccess}</p>
            </div>
          )}

          {!showPasswordSection ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowPasswordSection(true)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock size={20} />
                Alterar Senha
              </button>
              <button
                onClick={handleSendResetEmail}
                disabled={sendingResetEmail}
                className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-medium hover:bg-gray-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {sendingResetEmail ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail size={20} />
                    Enviar Email de Recuperação
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Senha Atual</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light"
                    placeholder="Digite sua senha atual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light"
                    placeholder="Digite sua nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 8 caracteres, 1 maiúscula, 1 número e 1 caractere especial
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light"
                    placeholder="Confirme sua nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Alterando...
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      Alterar Senha
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordSection(false)
                    setCurrentPassword("")
                    setNewPassword("")
                    setConfirmPassword("")
                    setPasswordError("")
                    setPasswordSuccess("")
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
