'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PatientSelect } from "@/components/ui/patient-select"

interface BudgetEditFormProps {
  budgetId: string
}

const formatCurrency = (value: string): string => {
  const numbers = value.replace(/\D/g, "")
  
  if (!numbers) return ""
  
  const numCents = parseInt(numbers, 10)
  const numValue = numCents / 100
  
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue)
}

export function BudgetEditForm({ budgetId }: BudgetEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    total_amount: "",
    patient_id: "",
    status: "pending",
  })

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          router.replace("/login")
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const response = await fetch(`${apiUrl}/api/budgets/${budgetId}`, {
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
        const budget = result.data

        setFormData({
          title: budget.title,
          description: budget.description || "",
          total_amount: formatCurrency(budget.total_amount.toString()),
          patient_id: budget.patient_id || "",
          status: budget.status,
        })
        setLoading(false)
      } catch (err) {
        console.error("Erro ao carregar orçamento:", err)
        setError("Erro ao carregar dados")
        setLoading(false)
      }
    }

    fetchBudget()
  }, [budgetId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        router.replace("/login")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/budgets/${budgetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          total_amount: parseFloat(formData.total_amount.replace(/\D/g, "")) / 100,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.replace("/login")
          return
        }
        throw new Error("Erro ao atualizar orçamento")
      }

      router.push(`/dashboard/orcamentos/${budgetId}`)
    } catch (err) {
      console.error("Erro ao atualizar orçamento:", err)
      alert("Erro ao atualizar orçamento")
    } finally {
      setSaving(false)
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-color-neutral-light">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <PatientSelect
            value={formData.patient_id}
            onChange={(patientId) =>
              setFormData({ ...formData, patient_id: patientId })
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Tratamento de Canal"
              className="w-full px-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor Total *
            </label>
            <input
              type="text"
              required
              value={formData.total_amount}
              onChange={(e) => {
                const formatted = formatCurrency(e.target.value)
                setFormData({ ...formData, total_amount: formatted })
              }}
              placeholder="R$ 0,00"
              className="w-full px-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detalhes do orçamento..."
            rows={4}
            className="w-full px-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary"
          >
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="completed">Concluído</option>
          </select>
        </div>

        <div className="flex gap-4 pt-6">
          <Link
            href={`/dashboard/orcamentos/${budgetId}`}
            className="flex items-center gap-2 px-6 py-2 border border-color-neutral-light rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            <ArrowLeft size={18} />
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition disabled:opacity-50 cursor-pointer"
          >
            <Save size={18} />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  )
}
