'use client'

import { useState, useEffect } from 'react'
import { Check, X, Clock, DollarSign, TrendingUp, AlertCircle, CheckCircle2, Search, Filter } from 'lucide-react'

interface PaymentRequest {
  id: string
  user_id: string
  plan: string
  amount: number
  status: string
  created_at: string
  rejection_reason?: string
}

export default function PagamentosPage() {
  return <PagamentosContent />
}

function PagamentosContent() {
  const [payments, setPayments] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/admin/payment-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setPayments(data.data || [])
      }
      setLoading(false)
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const approvePayment = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/admin/payments/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentRequestId: id }),
      })

      if (response.ok) {
        setPayments(payments.map((p) => (p.id === id ? { ...p, status: 'approved' } : p)))
      }
    } catch (error) {
      console.error('Erro ao aprovar pagamento:', error)
    }
  }

  const rejectPayment = async (id: string, reason: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/admin/payments/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentRequestId: id, reason }),
      })

      if (response.ok) {
        setPayments(payments.map((p) => (p.id === id ? { ...p, status: 'rejected' } : p)))
      }
    } catch (error) {
      console.error('Erro ao rejeitar pagamento:', error)
    }
  }

  const filteredPayments =
    filter === 'all' ? payments : payments.filter((p) => p.status === filter)

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    approved: payments.filter(p => p.status === 'approved').length,
    rejected: payments.filter(p => p.status === 'rejected').length,
    totalValue: payments.reduce((sum, p) => sum + p.amount, 0),
  }

  return (
    <div className="w-full">
      {/* Header Moderno */}
      <div className="mb-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Solicitações de Pagamento 💳</h1>
          <p className="text-lg text-gray-600">Aprove ou rejeite solicitações de upgrade de planos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900/70">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600 opacity-50" />
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
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900/70">Aprovados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-900/70">Rejeitados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <X className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900/70">Valor Total</p>
                <p className="text-xl font-bold text-gray-900">
                  R$ {stats.totalValue.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                filter === status
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' && 'Todos'}
              {status === 'pending' && 'Pendentes'}
              {status === 'approved' && 'Aprovados'}
              {status === 'rejected' && 'Rejeitados'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando solicitações...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-700 font-semibold text-lg mb-2">Nenhuma solicitação encontrada</p>
            <p className="text-gray-500">
              {filter !== 'all' ? 'Nenhuma solicitação com este filtro' : 'Nenhuma solicitação de pagamento ainda'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    ID do Usuário
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((payment, index) => (
                  <tr 
                    key={payment.id} 
                    className="hover:bg-gray-50 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <code className="text-sm font-mono font-semibold text-gray-900">
                        {payment.user_id.slice(0, 8)}...
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900 capitalize">{payment.plan}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">
                        R$ {payment.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={14} className="text-gray-400" />
                        {new Date(payment.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                          <Clock size={12} />
                          Pendente
                        </span>
                      )}
                      {payment.status === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
                          <Check size={12} />
                          Aprovado
                        </span>
                      )}
                      {payment.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
                          <X size={12} />
                          Rejeitado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => approvePayment(payment.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Check size={14} />
                            Aprovar
                          </button>
                          <button
                            onClick={() =>
                              rejectPayment(payment.id, 'Documentação incompleta')
                            }
                            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-xs font-semibold flex items-center gap-1.5"
                          >
                            <X size={14} />
                            Rejeitar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Counter */}
      {filteredPayments.length > 0 && (
        <div className="mt-6 text-sm text-gray-600 text-center">
          Mostrando <span className="font-semibold text-gray-900">{filteredPayments.length}</span> de{' '}
          <span className="font-semibold text-gray-900">{payments.length}</span> solicitações
        </div>
      )}
    </div>
  )
}
