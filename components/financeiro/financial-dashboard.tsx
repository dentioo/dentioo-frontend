"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { LancamentosForm } from "./lancamentos-form"

type TabMode = "grafico" | "lancamentos"

interface FinancialData {
  totalIncome: number
  totalExpenses: number
  revenueData: Array<{
    date: string
    income: number
    expense: number
  }>
  transactions: Array<{
    id: string
    description: string
    type: "income" | "expense"
    amount: number
    date: string
    category?: string
  }>
}

export function FinancialDashboard() {
  const router = useRouter()
  const [data, setData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tabMode, setTabMode] = useState<TabMode>("grafico")

  const fetchFinancialData = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        router.replace("/login")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/financial`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.replace("/login")
          return
        }
        throw new Error("Erro ao carregar dados financeiros")
      }

      const result = await response.json()
      setData(result.data || null)
      setLoading(false)
    } catch (err) {
      setError("Erro ao carregar dados financeiros")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFinancialData()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados financeiros...</p>
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

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 font-medium">Nenhum dado financeiro disponível</p>
      </div>
    )
  }

  const balance = data.totalIncome - data.totalExpenses

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="mb-8 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setTabMode("grafico")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              tabMode === "grafico"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Gráficos
          </button>
          <button
            onClick={() => setTabMode("lancamentos")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              tabMode === "lancamentos"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Lançamentos
          </button>
        </div>
      </div>

      {/* Tab Content - Gráfico */}
      {tabMode === "grafico" && (
        <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">Receita</span>
            <TrendingUp className="text-green-600" size={24} />
          </div>
          <h3 className="text-3xl font-bold text-green-900 mb-1">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(data.totalIncome)}
          </h3>
          <p className="text-sm text-green-700">Total de receitas</p>
        </div>

        {/* Expenses */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-700">Despesas</span>
            <TrendingDown className="text-red-600" size={24} />
          </div>
          <h3 className="text-3xl font-bold text-red-900 mb-1">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(data.totalExpenses)}
          </h3>
          <p className="text-sm text-red-700">Total de despesas</p>
        </div>

        {/* Balance */}
        <div
          className={`bg-gradient-to-br ${
            balance >= 0 ? "from-blue-50 to-blue-100 border-blue-200" : "from-orange-50 to-orange-100 border-orange-200"
          } rounded-xl p-6 border`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${balance >= 0 ? "text-blue-700" : "text-orange-700"}`}>Saldo</span>
            <div className={`${balance >= 0 ? "text-blue-600" : "text-orange-600"}`}>
              {balance >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            </div>
          </div>
          <h3 className={`text-3xl font-bold mb-1 ${balance >= 0 ? "text-blue-900" : "text-orange-900"}`}>
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(Math.abs(balance))}
          </h3>
          <p className={`text-sm ${balance >= 0 ? "text-blue-700" : "text-orange-700"}`}>
            {balance >= 0 ? "Saldo positivo" : "Saldo negativo"}
          </p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-color-neutral-light p-6">
        <h3 className="font-semibold text-color-primary mb-4">Receita vs Despesa (últimos 30 dias)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value: number) => `R$ ${value.toFixed(2)}`}
            />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name="Receita" />
            <Bar dataKey="expense" fill="#ef4444" name="Despesa" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-color-neutral-light overflow-hidden">
        <div className="p-6 border-b border-color-neutral-light">
          <h3 className="font-semibold text-color-primary">Últimas Transações</h3>
        </div>
        <table className="w-full">
          <thead className="bg-color-bg-light border-b border-color-neutral-light">
            <tr>
              <th className="text-left py-3 px-6 font-semibold text-color-primary text-sm">Descrição</th>
              <th className="text-left py-3 px-6 font-semibold text-color-primary text-sm">Tipo</th>
              <th className="text-left py-3 px-6 font-semibold text-color-primary text-sm">Valor</th>
              <th className="text-left py-3 px-6 font-semibold text-color-primary text-sm">Data</th>
            </tr>
          </thead>
          <tbody>
            {data.transactions.slice(0, 10).map((transaction) => (
              <tr key={transaction.id} className="border-b border-color-neutral-light hover:bg-color-bg-light transition">
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
                <td
                  className={`py-3 px-6 text-sm font-medium ${
                    transaction.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"} R$ {transaction.amount.toFixed(2).replace(".", ",")}
                </td>
                <td className="py-3 px-6 text-sm text-gray-600">
                  {new Date(transaction.date).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </>
      )}

      {/* Tab Content - Lançamentos */}
      {tabMode === "lancamentos" && (
        <LancamentosForm onSuccess={() => {
          fetchFinancialData()
        }} />
      )}
    </div>
  )
}
