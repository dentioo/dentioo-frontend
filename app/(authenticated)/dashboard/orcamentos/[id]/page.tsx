'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import Link from "next/link"
import { ArrowLeft, Edit2, Trash2 } from "lucide-react"
import { ConfirmModal } from "@/components/ui/confirm-modal"

interface Budget {
  id: string
  title: string
  description?: string
  total_amount: number
  status: "pending" | "approved" | "completed"
  created_at: string
  patient_id?: string
  patient_name?: string
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
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

export default function OrcamentoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [budget, setBudget] = useState<Budget | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          router.replace("/login")
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const response = await fetch(`${apiUrl}/api/budgets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            router.replace("/login")
            return
          }
          throw new Error("Orçamento não encontrado")
        }

        const result = await response.json()
        setBudget(result.data)
        setLoading(false)
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Erro ao carregar orçamento:", err)
        }
        setError("Erro ao carregar dados")
        setLoading(false)
      }
    }

    fetchBudget()
  }, [id, router])

  const handleDelete = async () => {
    setDeleteLoading(true)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        router.replace("/login")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/budgets/${id}`, {
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

      router.push("/dashboard/orcamentos")
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Erro ao deletar orçamento:", err)
      }
      alert("Erro ao deletar orçamento")
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando orçamento...</p>
        </div>
      </div>
    )
  }

  if (error || !budget) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-800">{error || "Orçamento não encontrado"}</p>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title={budget.title}
        description="Detalhes do orçamento"
        action={
          <Link
            href="/dashboard/orcamentos"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={20} />
            Voltar
          </Link>
        }
      />

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-color-neutral-light p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Título</h3>
              <p className="text-xl font-semibold text-gray-900">{budget.title}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Valor Total</h3>
              <p className="text-xl font-semibold text-color-primary">{formatCurrency(budget.total_amount)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Status</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(budget.status)}`}>
                {getStatusLabel(budget.status)}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Data de Criação</h3>
              <p className="text-gray-900">{new Date(budget.created_at).toLocaleDateString("pt-BR")}</p>
            </div>

            {budget.description && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Descrição</h3>
                <p className="text-gray-900 leading-relaxed">{budget.description}</p>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-8 border-t border-gray-200 mt-8">
            <Link
              href={`/dashboard/orcamentos/${id}/editar`}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              <Edit2 size={18} />
              Editar
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
            >
              <Trash2 size={18} />
              Deletar
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Deletar Orçamento"
        message={`Tem certeza que deseja deletar o orçamento "${budget.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={deleteLoading}
        isDangerous={true}
      />
    </>
  )
}
