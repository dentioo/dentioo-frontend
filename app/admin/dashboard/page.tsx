'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminGuard } from '@/components/admin-guard'
import { CountdownTimer } from '@/components/trial/countdown-timer'
import { LogOut } from 'lucide-react'

interface TrialKey {
  id: string
  key_code: string
  trial_days: number
  max_activations: number
  current_activations: number
  is_active: boolean
  description: string
  created_at: string
}

interface User {
  id: string
  email: string
  full_name: string
  clinic_name: string
  subscription_status: string
  trial_ends_at: string | null
  created_at: string
}

interface PaymentRequest {
  id: string
  user_id: string
  plan: string
  amount: number
  status: string
  created_at: string
  user_email: string
}

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  )
}

function AdminDashboardContent() {
  const router = useRouter()
  const [adminEmail, setAdminEmail] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<'keys' | 'users' | 'payments'>('keys')

  // Trial Keys
  const [trialKeys, setTrialKeys] = useState<TrialKey[]>([])
  const [newKeyForm, setNewKeyForm] = useState({
    trial_days: 14,
    max_activations: 1,
    description: '',
  })
  const [keyCode, setKeyCode] = useState('')

  // Users
  const [users, setUsers] = useState<User[]>([])

  // Payment Requests
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([])

  // Check authentication
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth) {
      try {
        const auth = JSON.parse(adminAuth)
        setAdminEmail(auth.email)
        setIsAuthenticated(true)
        // TODO: Fetch data from admin APIs
      } catch (error) {
        localStorage.removeItem('adminAuth')
        router.push('/admin/login')
      }
    } else {
      router.push('/admin/login')
    }
  }, [router])

  const generateTrialKey = async () => {
    try {
      // Generate key on the client side only (not during SSR)
      const timestamp = new Date().getTime().toString(36).toUpperCase()
      const random = Math.random().toString(36).substring(2, 10).toUpperCase()
      const keyCode = `TRIAL-${timestamp}-${random}`
      
      const response = await fetch('/api/admin/trial-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key_code: keyCode,
          ...newKeyForm,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTrialKeys([...trialKeys, data.data])
        setNewKeyForm({ trial_days: 14, max_activations: 1, description: '' })
        setKeyCode(keyCode)
      }
    } catch (error) {
      console.error('Erro ao gerar chave:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p>Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-y-auto">

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
          <button
            onClick={() => setActiveTab('keys')}
            className={`px-4 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'keys'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Chaves de Teste
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Usuários
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'payments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pagamentos
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="w-full">
        {/* Trial Keys Tab */}
        {activeTab === 'keys' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Gerar Chave de Teste</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dias de Teste
                  </label>
                  <input
                    type="number"
                    value={newKeyForm.trial_days}
                    onChange={(e) =>
                      setNewKeyForm({ ...newKeyForm, trial_days: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máx. Ativações
                  </label>
                  <input
                    type="number"
                    value={newKeyForm.max_activations}
                    onChange={(e) =>
                      setNewKeyForm({ ...newKeyForm, max_activations: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (Opcional)
                </label>
                <textarea
                  value={newKeyForm.description}
                  onChange={(e) =>
                    setNewKeyForm({ ...newKeyForm, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                />
              </div>

              <button
                onClick={generateTrialKey}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Gerar Chave
              </button>

              {keyCode && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Chave gerada com sucesso:</p>
                  <div className="flex items-center justify-between bg-white p-3 rounded border border-green-300">
                    <code className="font-mono font-bold text-green-700">{keyCode}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(keyCode)
                        alert('Copiado!')
                      }}
                      className="ml-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Trial Keys List */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Chaves Ativas</h2>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Dias
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Ativações
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Criada em
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {trialKeys.map((key) => (
                      <tr key={key.id}>
                        <td className="px-6 py-4 text-sm font-mono font-bold text-gray-900">
                          {key.key_code}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{key.trial_days}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {key.current_activations}/{key.max_activations}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              key.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {key.is_active ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(key.created_at).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Usuários Cadastrados</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Clínica
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Teste Expira
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.clinic_name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.subscription_status === 'trial'
                              ? 'bg-blue-100 text-blue-800'
                              : user.subscription_status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.subscription_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.trial_ends_at ? (
                          <CountdownTimer 
                            endDate={user.trial_ends_at}
                            className="text-xs"
                          />
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                          Detalhar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Solicitações de Pagamento</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Plano
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paymentRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{req.user_email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{req.plan}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        R$ {req.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            req.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : req.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        {req.status === 'pending' && (
                          <>
                            <button className="text-green-600 hover:text-green-700 font-medium">
                              Aprovar
                            </button>
                            <button className="text-red-600 hover:text-red-700 font-medium">
                              Rejeitar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
