"use client"

import { useState, useEffect } from "react"
import { Plus, Eye, Trash2, Edit2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { ConfirmModal } from "@/components/ui/confirm-modal"

interface Budget {
  id: string
  title: string
  description?: string
  total_amount: number
  status: "pending" | "approved" | "completed"
  created_at: string
  patient_id?: string
}

const formatCurrencyDisplay = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function BudgetsList() {
  const router = useRouter()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
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

      // Remover da lista
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
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  const totalBudgets = budgets.length
  const pendingBudgets = budgets.filter((b) => b.status === "pending").length
  const totalValue = budgets.reduce((sum, b) => sum + parseFloat(b.total_amount.toString()), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando orçamentos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-color-neutral-light p-6">
          <p className="text-sm text-gray-600 mb-1">Total de Orçamentos</p>
          <h3 className="text-3xl font-bold text-color-primary">{totalBudgets}</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-color-neutral-light p-6">
          <p className="text-sm text-gray-600 mb-1">Orçamentos Pendentes</p>
          <h3 className="text-3xl font-bold text-yellow-600">{pendingBudgets}</h3>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-color-neutral-light p-6">
          <p className="text-sm text-gray-600 mb-1">Valor Total</p>
          <h3 className="text-3xl font-bold text-color-primary">
            {formatCurrencyDisplay(totalValue)}
          </h3>
        </div>
      </div>

      {/* Budgets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-color-neutral-light overflow-hidden">
        <div className="p-6 border-b border-color-neutral-light flex justify-between items-center">
          <h3 className="font-semibold text-color-primary">Orçamentos</h3>
          <button
            onClick={() => router.push("/dashboard/orcamentos/novo")}
            className="flex items-center gap-2 px-4 py-2 bg-color-primary text-white rounded-lg hover:bg-color-primary-dark transition font-medium text-sm"
          >
            <Plus size={18} />
            Novo Orçamento
          </button>
        </div>

        {budgets.length > 0 ? (
          <table className="w-full">
            <thead className="bg-color-bg-light border-b border-color-neutral-light">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-color-primary text-sm">Título</th>
                <th className="text-left py-3 px-6 font-semibold text-color-primary text-sm">Valor</th>
                <th className="text-left py-3 px-6 font-semibold text-color-primary text-sm">Status</th>
                <th className="text-left py-3 px-6 font-semibold text-color-primary text-sm">Data</th>
                <th className="text-left py-3 px-6 font-semibold text-color-primary text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget) => (
                <tr key={budget.id} className="border-b border-color-neutral-light hover:bg-color-bg-light transition">
                  <td className="py-3 px-6 text-sm font-medium text-gray-900">{budget.title}</td>
                  <td className="py-3 px-6 text-sm text-gray-600">{formatCurrencyDisplay(parseFloat(budget.total_amount.toString()))}</td>
                  <td className="py-3 px-6 text-sm">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(budget.status)}`}>
                      {getStatusLabel(budget.status)}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-600">
                    {new Date(budget.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-3 px-6 text-sm flex gap-2">
                    <button 
                      onClick={() => router.push(`/dashboard/orcamentos/${budget.id}`)}
                      className="p-1 hover:bg-blue-100 rounded transition text-color-primary cursor-pointer"
                      title="Visualizar"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => router.push(`/dashboard/orcamentos/${budget.id}/editar`)}
                      className="p-1 hover:bg-gray-200 rounded transition text-gray-600 cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedBudgetId(budget.id)
                        setShowDeleteConfirm(true)
                      }}
                      className="p-1 hover:bg-red-100 rounded transition text-red-600 cursor-pointer"
                      title="Deletar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 font-medium">Nenhum orçamento encontrado</p>
            <p className="text-sm text-gray-400 mt-1">Crie o primeiro orçamento para começar</p>
          </div>
        )}
      </div>

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
