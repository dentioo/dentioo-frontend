'use client'

import { useState, useEffect } from "react"
import { 
  Plus, 
  Eye, 
  Trash2, 
  Edit2, 
  Search,
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  TrendingUp,
  Grid3x3,
  List,
  BarChart3,
  Calendar,
  ArrowRight,
  Filter
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ConfirmModal } from "@/components/ui/confirm-modal"

type ViewMode = 'cards' | 'list' | 'stats'
type FilterStatus = 'all' | 'pending' | 'approved' | 'completed'

interface Budget {
  id: string
  title: string
  description?: string
  total_amount: number
  status: "pending" | "approved" | "completed"
  created_at: string
  patient_id?: string
}

/* ============================================
   BACKUP DO CÓDIGO ANTERIOR (COMENTADO)
   ============================================
   
'use client'

import { PageHeader } from "@/components/ui/page-header"
import { BudgetsList } from "@/components/orcamentos/budgets-list"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function OrcamentosPage() {
  return (
    <>
      <PageHeader
        title="Orçamentos"
        description="Visualize e gerencie seus orçamentos"
        action={
          <Link href="/dashboard/orcamentos/novo" className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Novo Orçamento
          </Link>
        }
      />

      <BudgetsList />
    </>
  )
}

   ============================================
   FIM DO BACKUP
   ============================================ */

const formatCurrencyDisplay = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function OrcamentosPage() {
  const router = useRouter()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          router.replace("/login")
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const response = await fetch(`${apiUrl}/api/budgets`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            router.replace("/login")
            return
          }
          throw new Error("Erro ao carregar orçamentos")
        }

        const result = await response.json()
        setBudgets(result.data || [])
        setLoading(false)
      } catch (err) {
        console.error("Erro ao carregar orçamentos:", err)
        setError("Erro ao carregar dados")
        setLoading(false)
      }
    }

    fetchBudgets()
  }, [router])

  const handleDelete = async () => {
    if (!selectedBudgetId) return

    setDeleteLoading(true)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        router.replace("/login")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/budgets/${selectedBudgetId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.replace("/login")
          return
        }
        throw new Error("Erro ao deletar orçamento")
      }

      setBudgets(budgets.filter((b) => b.id !== selectedBudgetId))
      setShowDeleteConfirm(false)
      setSelectedBudgetId(null)
    } catch (err) {
      console.error("Erro ao deletar orçamento:", err)
      alert("Erro ao deletar orçamento")
    } finally {
      setDeleteLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "approved":
        return "bg-green-100 text-green-800 border-green-300"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente"
      case "approved":
        return "Aprovado"
      case "completed":
        return "Concluído"
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Clock
      case "approved":
        return CheckCircle2
      case "completed":
        return CheckCircle2
      default:
        return FileText
    }
  }

  const filteredBudgets = budgets.filter((budget) => {
    const matchSearch = budget.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (budget.description && budget.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchStatus = filterStatus === 'all' || budget.status === filterStatus
    
    return matchSearch && matchStatus
  })

  const stats = {
    total: budgets.length,
    pending: budgets.filter((b) => b.status === "pending").length,
    approved: budgets.filter((b) => b.status === "approved").length,
    completed: budgets.filter((b) => b.status === "completed").length,
    totalValue: budgets.reduce((sum, b) => sum + parseFloat(b.total_amount.toString()), 0),
    pendingValue: budgets
      .filter((b) => b.status === "pending")
      .reduce((sum, b) => sum + parseFloat(b.total_amount.toString()), 0),
    approvedValue: budgets
      .filter((b) => b.status === "approved")
      .reduce((sum, b) => sum + parseFloat(b.total_amount.toString()), 0),
    completedValue: budgets
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + parseFloat(b.total_amount.toString()), 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando orçamentos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header Moderno */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Orçamentos 💰</h1>
            <p className="text-lg text-gray-600">Gerencie seus orçamentos e propostas</p>
          </div>
          <Link
            href="/dashboard/orcamentos/novo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            Novo Orçamento
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900/70">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600 opacity-50" />
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
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-900/70">Concluídos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-indigo-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900/70">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrencyDisplay(stats.totalValue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4 overflow-x-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              viewMode === 'cards'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Grid3x3 size={18} />
            Cards
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              viewMode === 'list'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <List size={18} />
            Lista
          </button>
          <button
            onClick={() => setViewMode('stats')}
            className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              viewMode === 'stats'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <BarChart3 size={18} />
            Estatísticas
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      {viewMode !== 'stats' && (
        <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por título ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filterStatus === 'pending'
                    ? 'bg-yellow-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pendentes
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filterStatus === 'approved'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Aprovados
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filterStatus === 'completed'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Concluídos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="animate-in fade-in duration-300">
        {viewMode === 'cards' && (
          <>
            {filteredBudgets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBudgets.map((budget, index) => {
                  const StatusIcon = getStatusIcon(budget.status)
                  return (
                    <div
                      key={budget.id}
                      className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl ${getStatusColor(budget.status)}`}>
                            <StatusIcon size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{budget.title}</h3>
                            {budget.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{budget.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-3xl font-bold text-gray-900 mb-2">
                          {formatCurrencyDisplay(parseFloat(budget.total_amount.toString()))}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} className="text-gray-400" />
                          <span>{new Date(budget.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                            getStatusColor(budget.status)
                          }`}
                        >
                          {getStatusLabel(budget.status)}
                        </span>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/orcamentos/${budget.id}`}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                            title="Visualizar"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            href={`/dashboard/orcamentos/${budget.id}/editar`}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedBudgetId(budget.id)
                              setShowDeleteConfirm(true)
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                            title="Deletar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-700 font-semibold text-lg mb-2">Nenhum orçamento encontrado</p>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filterStatus !== 'all' ? 'Tente ajustar sua busca ou filtros' : 'Comece criando seu primeiro orçamento'}
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Link
                    href="/dashboard/orcamentos/novo"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    <Plus size={20} />
                    Criar Primeiro Orçamento
                  </Link>
                )}
              </div>
            )}
          </>
        )}

        {viewMode === 'list' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Título</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Valor</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Data</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBudgets.map((budget) => (
                    <tr
                      key={budget.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-gray-900">{budget.title}</p>
                          {budget.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{budget.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-900">
                          {formatCurrencyDisplay(parseFloat(budget.total_amount.toString()))}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold border ${
                            getStatusColor(budget.status)
                          }`}
                        >
                          {getStatusLabel(budget.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          {new Date(budget.created_at).toLocaleDateString("pt-BR")}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/orcamentos/${budget.id}`}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                            title="Visualizar"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            href={`/dashboard/orcamentos/${budget.id}/editar`}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedBudgetId(budget.id)
                              setShowDeleteConfirm(true)
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                            title="Deletar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredBudgets.length === 0 && (
              <div className="py-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Nenhum orçamento encontrado</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Distribuição por Status</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Pendentes</span>
                      <span className="text-sm font-bold text-gray-900">{stats.pending}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Aprovados</span>
                      <span className="text-sm font-bold text-gray-900">{stats.approved}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.approved / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Concluídos</span>
                      <span className="text-sm font-bold text-gray-900">{stats.completed}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Valores por Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-gray-900">Pendentes</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{formatCurrencyDisplay(stats.pendingValue)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900">Aprovados</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{formatCurrencyDisplay(stats.approvedValue)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Concluídos</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{formatCurrencyDisplay(stats.completedValue)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Resumo Geral</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600 mt-1">Total</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-xl">
                  <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                  <p className="text-sm text-gray-600 mt-1">Pendentes</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
                  <p className="text-sm text-gray-600 mt-1">Aprovados</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrencyDisplay(stats.totalValue)}</p>
                  <p className="text-sm text-gray-600 mt-1">Valor Total</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Counter */}
      {viewMode !== 'stats' && filteredBudgets.length > 0 && (
        <div className="mt-6 text-sm text-gray-600 text-center">
          Mostrando <span className="font-semibold text-gray-900">{filteredBudgets.length}</span> de{' '}
          <span className="font-semibold text-gray-900">{budgets.length}</span> orçamentos
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Deletar Orçamento"
        message="Tem certeza que deseja deletar este orçamento? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteConfirm(false)
          setSelectedBudgetId(null)
        }}
        isLoading={deleteLoading}
        isDangerous={true}
      />
    </div>
  )
}
