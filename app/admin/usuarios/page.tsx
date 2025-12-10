'use client'

import { useState, useEffect } from 'react'
import { Mail, Building2, Phone, Calendar, Users, CheckCircle2, Clock, Search, TrendingUp, Shield } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  clinic_name: string
  phone: string | null
  role: string
  verified: boolean
  created_at: string
  last_login_at: string | null
  subscription_status?: string
  subscription_is_active?: boolean
  subscription_plan_name?: string
  subscription_plan_type?: string
  subscription_status_field?: string
  trial_ends_at?: string | null
}

export default function UsuariosPage() {
  return <UsuariosContent />
}

function UsuariosContent() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.data || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Erro ao buscar usuários:', errorData.message || 'Erro desconhecido')
        // Ainda definir array vazio para não ficar em loading infinito
        setUsers([])
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      (user.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (user.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (user.clinic_name?.toLowerCase() || '').includes(search.toLowerCase())
  )

  const stats = {
    total: users.length,
    verified: users.filter(u => u.verified).length,
    pending: users.filter(u => !u.verified).length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
  }

  return (
    <div className="w-full">
      {/* Header Moderno */}
      <div className="mb-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Usuários 👥</h1>
          <p className="text-lg text-gray-600">Gerenciamento de clínicas cadastradas no sistema</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900/70">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900/70">Verificados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-900/70">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900/70">Admins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por email, nome ou clínica..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando usuários...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-700 font-semibold text-lg mb-2">Nenhum usuário encontrado</p>
            <p className="text-gray-500">
              {search ? 'Tente ajustar sua busca' : 'Nenhum usuário cadastrado ainda'}
            </p>
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
                    Clínica
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Plano
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-gray-50 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Mail size={16} className="text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.full_name || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 size={16} className="text-gray-400" />
                        {user.clinic_name || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold border ${
                          user.role === 'super_admin'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                        }`}
                      >
                        {user.role === 'super_admin'
                          ? 'Super Admin'
                          : user.role === 'admin'
                          ? 'Admin'
                          : 'Clínica'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {user.phone ? (
                          <>
                            <Phone size={16} className="text-gray-400" />
                            {user.phone}
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold border ${
                          user.verified
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        }`}
                      >
                        {user.verified ? 'Verificado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold border ${
                          user.subscription_is_active
                            ? user.subscription_plan_type === 'premium' || user.subscription_status === 'enterprise'
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : user.subscription_plan_type === 'professional' || user.subscription_status === 'professional'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : user.subscription_plan_type === 'starter' || user.subscription_status === 'basic'
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-gray-100 text-gray-800 border-gray-300'
                        }`}
                      >
                        {user.subscription_is_active 
                          ? user.subscription_plan_name || 'Ativo'
                          : 'Sem Plano'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Counter */}
      {filteredUsers.length > 0 && (
        <div className="mt-6 text-sm text-gray-600 text-center">
          Mostrando <span className="font-semibold text-gray-900">{filteredUsers.length}</span> de{' '}
          <span className="font-semibold text-gray-900">{users.length}</span> usuários
        </div>
      )}
    </div>
  )
}
