'use client'

import { useState, useEffect } from 'react'
import { Plus, Shield, AlertCircle, Users, X, CheckCircle2, Mail, Calendar, Crown, UserCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Admin {
  user_id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
}

export default function GerenciarAdminsPage() {
  return <GerenciarAdminsContent />
}

function GerenciarAdminsContent() {
  const router = useRouter()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formEmail, setFormEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedAdminToDeactivate, setSelectedAdminToDeactivate] = useState<Admin | null>(null)

  useEffect(() => {
    // Verificar se é super_admin
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.role !== 'super_admin') {
          router.replace('/admin/trial-keys')
        }
      } catch {
        router.replace('/login')
      }
    }
  }, [router])

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/admin/list-admins`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setAdmins(data.data || [])
      }
    } catch (error) {
      // Erro silencioso
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const handleActivateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Buscar todos os usuários para encontrar o que está sendo ativado
      const usersResponse = await fetch(`${apiUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!usersResponse.ok) {
        setError('Erro ao buscar usuários')
        return
      }

      const usersData = await usersResponse.json()
      const userToActivate = usersData.data.find((u: any) => u.email === formEmail)

      if (!userToActivate) {
        setError('Usuário com esse e-mail não encontrado')
        return
      }

      if (userToActivate.role === 'admin' || userToActivate.role === 'super_admin') {
        setError('Este usuário já é um administrador')
        return
      }

      // Promover usuário a admin - só passar o email, sistema já sabe o nome
      const response = await fetch(`${apiUrl}/api/admin/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formEmail,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAdmins([...admins, data.data])
        setFormEmail('')
        setShowForm(false)
        setSuccess('Administrador ativado com sucesso!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Erro ao ativar admin')
      }
    } catch (error) {
      console.error('Erro ao ativar admin:', error)
      setError('Erro ao conectar ao servidor')
    }
  }

  const handleDeactivateClick = (admin: Admin) => {
    setSelectedAdminToDeactivate(admin)
    setShowConfirmModal(true)
  }

  const confirmDeactivate = async () => {
    if (!selectedAdminToDeactivate) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/admin/toggle-admin-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: selectedAdminToDeactivate.user_id, is_active: false }),
      })

      if (response.ok) {
        setAdmins(
          admins.filter((a) => a.user_id !== selectedAdminToDeactivate.user_id)
        )
        setShowConfirmModal(false)
        setSelectedAdminToDeactivate(null)
        setSuccess('Administrador desativado com sucesso!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Erro ao desativar admin:', error)
      setError('Erro ao desativar administrador')
    }
  }

  const stats = {
    total: admins.length,
    superAdmins: admins.filter(a => a.role === 'super_admin').length,
    admins: admins.filter(a => a.role === 'admin').length,
  }

  return (
    <div className="w-full">
      {/* Header Moderno */}
      <div className="mb-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Gerenciar Administradores 👑</h1>
            <p className="text-base sm:text-lg text-gray-600 flex items-center gap-2">
              <Shield size={20} className="text-purple-600 flex-shrink-0" />
              <span className="break-words">Super Admin - Gerenciamento de usuários administradores</span>
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium whitespace-nowrap flex-shrink-0 w-full sm:w-auto"
          >
            {showForm ? (
              <>
                <X size={20} />
                Cancelar
              </>
            ) : (
              <>
                <Plus size={20} />
                Novo Admin
              </>
            )}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900/70">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-900/70">Super Admins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.superAdmins}</p>
              </div>
              <Crown className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-900/70">Admins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
              </div>
              <Shield className="w-8 h-8 text-indigo-600 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Mensagens de erro e sucesso */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 animate-in fade-in duration-300">
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 size={20} />
          <span className="font-medium">{success}</span>
        </div>
      )}

      {/* Formulário */}
      {showForm && (
        <form onSubmit={handleActivateAdmin} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6 animate-in fade-in duration-300">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail do Usuário
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Digite o e-mail de um usuário cadastrado para ativá-lo como administrador
              </p>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="usuario@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg font-semibold flex items-center gap-2"
              >
                <UserCheck size={20} />
                Ativar Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormEmail('')
                  setError('')
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando administradores...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-700 font-semibold text-lg mb-2">Nenhum administrador ativado</p>
            <p className="text-gray-500">Comece ativando seu primeiro administrador</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map((admin, index) => (
                  <tr 
                    key={admin.user_id} 
                    className="hover:bg-gray-50 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Mail size={16} className="text-gray-400" />
                        {admin.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{admin.full_name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                          admin.role === 'super_admin'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-purple-100 text-purple-800 border-purple-300'
                        }`}
                      >
                        {admin.role === 'super_admin' ? (
                          <>
                            <Crown size={12} />
                            Super Admin
                          </>
                        ) : (
                          <>
                            <Shield size={12} />
                            Admin
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(admin.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeactivateClick(admin)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors border border-red-200"
                      >
                        Desativar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Confirmação */}
      {showConfirmModal && selectedAdminToDeactivate && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => {
              setShowConfirmModal(false)
              setSelectedAdminToDeactivate(null)
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 pointer-events-auto animate-in fade-in zoom-in duration-200">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="text-red-600" size={24} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Desativar Administrador</h2>
                  <p className="text-gray-600 mb-2">
                    Tem certeza que deseja desativar o administrador:
                  </p>
                  <p className="font-semibold text-gray-900 mb-4">
                    {selectedAdminToDeactivate.full_name} ({selectedAdminToDeactivate.email})
                  </p>
                  <p className="text-sm text-red-600">
                    Esta ação removerá o usuário da tabela de administradores.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowConfirmModal(false)
                    setSelectedAdminToDeactivate(null)
                  }}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeactivate}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center gap-2"
                >
                  <AlertCircle size={16} />
                  Desativar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
