"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface LancamentosFormProps {
  onSuccess?: () => void
}

interface Transaction {
  id: string
  description: string
  type: "income" | "expense"
  amount: number
  date: string
  category?: string
}

export function LancamentosForm({ onSuccess }: LancamentosFormProps) {
  const [type, setType] = useState<"income" | "expense">("income")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)

  const incomeCategories = ["Consulta", "Procedimento", "Tratamento", "Outro"]
  const expenseCategories = ["Aluguel", "Funcionários", "Materiais", "Equipamento", "Utilidades", "Outro"]

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true)
      const token = localStorage.getItem("token")
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/financial/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const result = await response.json()
        setTransactions(result.data || [])
      }
    } catch (err) {
      console.error("Erro ao carregar lançamentos:", err)
    } finally {
      setLoadingTransactions(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, "")
    if (!numbers) return ""
    const numCents = parseInt(numbers, 10)
    const numValue = numCents / 100
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numValue)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    setAmount(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!description || !amount || !category) {
      setError("Preencha todos os campos obrigatórios")
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Sessão expirada")
        return
      }

      // Parse amount to number
      const numbers = amount.replace(/\D/g, "")
      if (!numbers) {
        setError("Valor inválido")
        setLoading(false)
        return
      }

      const amountValue = parseFloat(numbers) / 100

      if (isNaN(amountValue) || amountValue <= 0) {
        setError("Valor deve ser maior que zero")
        setLoading(false)
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/financial/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          description,
          amount: amountValue,
          date,
          category,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          setError("Sessão expirada")
          return
        }
        throw new Error("Erro ao registrar lançamento")
      }

      setSuccess(true)
      setDescription("")
      setAmount("")
      setCategory("")
      setDate(new Date().toISOString().split("T")[0])
      setType("income")

      // Recarregar lançamentos
      await fetchTransactions()

      setTimeout(() => {
        setSuccess(false)
        onSuccess?.()
      }, 2000)
    } catch (err) {
      console.error("Erro ao registrar lançamento:", err)
      setError("Erro ao registrar lançamento. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-color-neutral-light p-8">
        <h3 className="font-semibold text-color-primary mb-8 text-lg">Novo Lançamento</h3>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <p className="text-green-700 font-medium">Lançamento registrado com sucesso!</p>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="text-green-600 hover:text-green-800"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <p className="text-red-700 font-medium">{error}</p>
            <button type="button" onClick={() => setError("")} className="text-red-600 hover:text-red-800">
              <X size={20} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Lançamento</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={type === "income"}
                  onChange={(e) => {
                    setType(e.target.value as "income" | "expense")
                    setCategory("")
                  }}
                  className="w-4 h-4 text-green-600"
                />
                <span className="ml-2 text-sm text-gray-700">Receita</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={type === "expense"}
                  onChange={(e) => {
                    setType(e.target.value as "income" | "expense")
                    setCategory("")
                  }}
                  className="w-4 h-4 text-red-600"
                />
                <span className="ml-2 text-sm text-gray-700">Despesa</span>
              </label>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary focus:border-transparent"
            >
              <option value="">Selecione uma categoria</option>
              {(type === "income" ? incomeCategories : expenseCategories).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Valor</label>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="R$ 0,00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary focus:border-transparent"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o lançamento..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary focus:border-transparent resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Registrando..." : "Registrar Lançamento"}
        </button>
      </form>

      {/* Recent Lancamentos */}
      <div className="bg-white rounded-xl shadow-sm border border-color-neutral-light overflow-hidden">
        <div className="p-6 border-b border-color-neutral-light">
          <h3 className="font-semibold text-color-primary">Últimos Lançamentos</h3>
        </div>
        {loadingTransactions ? (
          <div className="p-6 text-center text-gray-500">
            <p className="text-sm">Carregando lançamentos...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p className="text-sm">Nenhum lançamento registrado ainda</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-color-primary text-sm">Descrição</th>
                <th className="text-left py-3 px-6 font-semibold text-color-primary text-sm">Tipo</th>
                <th className="text-left py-3 px-6 font-semibold text-color-primary text-sm">Categoria</th>
                <th className="text-right py-3 px-6 font-semibold text-color-primary text-sm">Valor</th>
                <th className="text-left py-3 px-6 font-semibold text-color-primary text-sm">Data</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 px-6 text-sm text-gray-900">{transaction.description}</td>
                  <td className="py-3 px-6 text-sm">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.type === "income"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {transaction.type === "income" ? "Receita" : "Despesa"}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-600">{transaction.category || "-"}</td>
                  <td
                    className={`py-3 px-6 text-sm font-semibold text-right ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(transaction.amount)}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-600">
                    {new Date(transaction.date).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
