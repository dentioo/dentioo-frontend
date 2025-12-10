'use client'

import { useState, useEffect } from "react"
import { 
  TrendingUp, 
  TrendingDown, 
  Plus,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  BarChart3,
  LineChart as LineChartIcon,
  Calendar,
  Search,
  Filter,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react"
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
  PieChart,
  Pie,
  Cell,
} from "recharts"

type TabMode = "grafico" | "lancamentos" | "stats"

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

interface Transaction {
  id: string
  description: string
  type: "income" | "expense"
  amount: number
  date: string
  category?: string
}

/* ============================================
   BACKUP DO CÓDIGO ANTERIOR (COMENTADO)
   ============================================
   
'use client'

import { PageHeader } from "@/components/ui/page-header"
import { FinancialDashboard } from "@/components/financeiro/financial-dashboard"

export default function FinanceiroPage() {
  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Gerencie seus pagamentos e finanças"
      />

      <FinancialDashboard />
    </>
  )
}

   ============================================
   FIM DO BACKUP
   ============================================ */

const COLORS = {
  income: '#10b981',
  expense: '#ef4444',
}

const PIE_COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']

export default function FinanceiroPage() {
  const router = useRouter()
  const [data, setData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tabMode, setTabMode] = useState<TabMode>("grafico")
  const [type, setType] = useState<"income" | "expense">("income")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [category, setCategory] = useState("")
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  
  // Estados para filtro de datas
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]
  })
  
  // Carregar estado inicial do localStorage (padrão: true/mostrar)
  const [showValues, setShowValues] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dentioo_financeiro_show_values")
      return saved !== null ? saved === "true" : true // Padrão: mostrar
    }
    return true
  })

  // Salvar no localStorage sempre que o estado mudar
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dentioo_financeiro_show_values", String(showValues))
    }
  }, [showValues])

  const incomeCategories = ["Consulta", "Procedimento", "Tratamento", "Outro"]
  const expenseCategories = ["Aluguel", "Funcionários", "Materiais", "Equipamento", "Utilidades", "Outro"]

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
      
      // Buscar todas as transações para filtrar corretamente
      const transactionsResponse = await fetch(`${apiUrl}/api/financial/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      let allTransactions: any[] = []
      if (transactionsResponse.ok) {
        const transactionsResult = await transactionsResponse.json()
        allTransactions = transactionsResult.data || []
      }
      
      // Filtrar dados por período selecionado
      if (startDate && endDate && allTransactions.length > 0) {
        // Criar datas no timezone local para evitar problemas de timezone
        const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
        const [endYear, endMonth, endDay] = endDate.split('-').map(Number)
        const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0)
        const end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999)
        
        // Filtrar transações por data
        const filteredTransactions = allTransactions.filter((t: any) => {
          const transactionDate = new Date(t.date)
          return transactionDate >= start && transactionDate <= end
        })
        
        // Calcular totais filtrados
        const filteredTotalIncome = filteredTransactions
          .filter((t: any) => t.type === 'income')
          .reduce((sum: number, t: any) => sum + (parseFloat(t.amount.toString()) || 0), 0)
        
        const filteredTotalExpenses = filteredTransactions
          .filter((t: any) => t.type === 'expense')
          .reduce((sum: number, t: any) => sum + (parseFloat(t.amount.toString()) || 0), 0)
        
        // Criar dados agrupados por data no período filtrado
        const groupedByDate: { [key: string]: { income: number; expense: number } } = {}
        
        filteredTransactions.forEach((transaction: any) => {
          const date = new Date(transaction.date).toISOString().split('T')[0]
          if (!groupedByDate[date]) {
            groupedByDate[date] = { income: 0, expense: 0 }
          }
          
          const amount = parseFloat(transaction.amount.toString()) || 0
          if (transaction.type === 'income') {
            groupedByDate[date].income += amount
          } else {
            groupedByDate[date].expense += amount
          }
        })
        
        const finalRevenueData = Object.entries(groupedByDate)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, data]) => ({
            date: new Date(date).toLocaleDateString('pt-BR'),
            income: data.income,
            expense: data.expense,
          }))
        
        setData({
          ...result.data,
          totalIncome: filteredTotalIncome,
          totalExpenses: filteredTotalExpenses,
          revenueData: finalRevenueData,
          transactions: filteredTransactions.slice(0, 10),
        })
      } else {
        setData(result.data || null)
      }
      
      setLoading(false)
    } catch (err) {
      console.error("Erro ao carregar dados financeiros:", err)
      setError("Erro ao carregar dados financeiros")
      setLoading(false)
    }
  }

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
        // Aplicar filtro de datas se necessário
        if (startDate && endDate && result.data) {
          // Criar datas no timezone local para evitar problemas de timezone
          const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
          const [endYear, endMonth, endDay] = endDate.split('-').map(Number)
          const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0)
          const end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999)
          
          const filtered = result.data.filter((t: any) => {
            const transactionDate = new Date(t.date)
            return transactionDate >= start && transactionDate <= end
          })
          setTransactions(filtered)
        } else {
          setTransactions(result.data || [])
        }
      }
    } catch (err) {
      console.error("Erro ao carregar lançamentos:", err)
    } finally {
      setLoadingTransactions(false)
    }
  }

  useEffect(() => {
    fetchFinancialData()
  }, [router, startDate, endDate])

  useEffect(() => {
    fetchTransactions()
  }, [router, startDate, endDate])

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
    setFormError("")
    setFormSuccess(false)

    if (!description || !amount || !category) {
      setFormError("Preencha todos os campos obrigatórios")
      return
    }

    setFormLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setFormError("Sessão expirada")
        return
      }

      const numbers = amount.replace(/\D/g, "")
      if (!numbers) {
        setFormError("Valor inválido")
        setFormLoading(false)
        return
      }

      const amountValue = parseFloat(numbers) / 100

      if (isNaN(amountValue) || amountValue <= 0) {
        setFormError("Valor deve ser maior que zero")
        setFormLoading(false)
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
          setFormError("Sessão expirada")
          return
        }
        throw new Error("Erro ao registrar lançamento")
      }

      setFormSuccess(true)
      setDescription("")
      setAmount("")
      setCategory("")
      setDate(new Date().toISOString().split("T")[0])
      setType("income")

      await fetchTransactions()
      await fetchFinancialData()

      setTimeout(() => {
        setFormSuccess(false)
      }, 3000)
    } catch (err) {
      console.error("Erro ao registrar lançamento:", err)
      setFormError("Erro ao registrar lançamento. Tente novamente.")
    } finally {
      setFormLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados financeiros...</p>
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

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 font-semibold text-lg mb-2">Nenhum dado financeiro disponível</p>
          <p className="text-gray-500">Comece registrando seu primeiro lançamento</p>
        </div>
      </div>
    )
  }

  const balance = data.totalIncome - data.totalExpenses
  const filteredTransactions = transactions.filter((t) => {
    const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchType = filterType === 'all' || t.type === filterType
    return matchSearch && matchType
  })

  const categoryData = [
    { name: 'Receita', value: data.totalIncome },
    { name: 'Despesa', value: data.totalExpenses },
  ]

  const incomeByCategory = transactions
    .filter(t => t.type === 'income' && t.category)
    .reduce((acc: Record<string, number>, t) => {
      acc[t.category!] = (acc[t.category!] || 0) + t.amount
      return acc
    }, {})

  const expenseByCategory = transactions
    .filter(t => t.type === 'expense' && t.category)
    .reduce((acc: Record<string, number>, t) => {
      acc[t.category!] = (acc[t.category!] || 0) + t.amount
      return acc
    }, {})

  return (
    <div className="w-full">
      {/* Header Moderno */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Financeiro 💰</h1>
            <p className="text-lg text-gray-600">Gerencie seus pagamentos e finanças</p>
          </div>
          <button
            onClick={() => setShowValues(!showValues)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={showValues ? "Ocultar valores" : "Mostrar valores"}
            title={showValues ? "Ocultar valores" : "Mostrar valores"}
          >
            {showValues ? (
              <Eye className="text-gray-600" size={24} />
            ) : (
              <EyeOff className="text-gray-600" size={24} />
            )}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Revenue */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>
              <p className="text-sm font-medium text-green-900/70 mb-1">Receita Total</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {showValues ? (
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(data.totalIncome)
                ) : (
                  <span className="select-none">••••••</span>
                )}
              </p>
              <div className="flex items-center text-sm text-green-700">
                <ArrowUpCircle size={14} className="mr-1" />
                <span>Entradas</span>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-200 rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <TrendingDown className="text-red-600" size={24} />
                </div>
              </div>
              <p className="text-sm font-medium text-red-900/70 mb-1">Despesa Total</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {showValues ? (
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(data.totalExpenses)
                ) : (
                  <span className="select-none">••••••</span>
                )}
              </p>
              <div className="flex items-center text-sm text-red-700">
                <ArrowDownCircle size={14} className="mr-1" />
                <span>Saídas</span>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className={`group relative overflow-hidden bg-gradient-to-br ${
            balance >= 0 
              ? "from-blue-50 to-blue-100 border-blue-200" 
              : "from-orange-50 to-orange-100 border-orange-200"
          } rounded-2xl p-6 border hover:shadow-lg transition-all duration-300`}>
            <div className={`absolute top-0 right-0 w-32 h-32 ${
              balance >= 0 ? "bg-blue-200" : "bg-orange-200"
            } rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-30 transition-opacity`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-white rounded-xl shadow-sm`}>
                  {balance >= 0 ? (
                    <DollarSign className="text-blue-600" size={24} />
                  ) : (
                    <AlertCircle className="text-orange-600" size={24} />
                  )}
                </div>
              </div>
              <p className={`text-sm font-medium mb-1 ${
                balance >= 0 ? "text-blue-900/70" : "text-orange-900/70"
              }`}>Saldo</p>
              <p className={`text-4xl font-bold mb-2 ${
                balance >= 0 ? "text-blue-900" : "text-orange-900"
              }`}>
                {showValues ? (
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(Math.abs(balance))
                ) : (
                  <span className="select-none">••••••</span>
                )}
              </p>
              <div className={`flex items-center text-sm ${
                balance >= 0 ? "text-blue-700" : "text-orange-700"
              }`}>
                {balance >= 0 ? (
                  <>
                    <CheckCircle2 size={14} className="mr-1" />
                    <span>Positivo</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} className="mr-1" />
                    <span>Negativo</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filtro de Datas */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => {
                const date = new Date()
                date.setDate(date.getDate() - 30)
                setStartDate(date.toISOString().split('T')[0])
                setEndDate(new Date().toISOString().split('T')[0])
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors whitespace-nowrap"
            >
              Últimos 30 dias
            </button>
            <button
              onClick={() => {
                const date = new Date()
                date.setMonth(date.getMonth() - 1)
                setStartDate(new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0])
                setEndDate(new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0])
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors whitespace-nowrap"
            >
              Mês Anterior
            </button>
            <button
              onClick={() => {
                const date = new Date()
                setStartDate(new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0])
                setEndDate(new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0])
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
            >
              Mês Atual
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4 overflow-x-auto">
          <button
            onClick={() => setTabMode("grafico")}
            className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              tabMode === "grafico"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <BarChart3 size={18} />
            Gráficos
          </button>
          <button
            onClick={() => setTabMode("lancamentos")}
            className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              tabMode === "lancamentos"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <Plus size={18} />
            Lançamentos
          </button>
          <button
            onClick={() => setTabMode("stats")}
            className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              tabMode === "stats"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <LineChartIcon size={18} />
            Estatísticas
          </button>
        </div>
      </div>

      {/* Tab Content - Gráfico */}
      {tabMode === "grafico" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Receita vs Despesa
              {startDate && endDate && (
                <span className="text-base font-normal text-gray-600 ml-2">
                  ({(() => {
                    // Criar data no timezone local para evitar problemas de timezone
                    const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
                    const [endYear, endMonth, endDay] = endDate.split('-').map(Number)
                    const startDateLocal = new Date(startYear, startMonth - 1, startDay)
                    const endDateLocal = new Date(endYear, endMonth - 1, endDay)
                    return `${startDateLocal.toLocaleDateString('pt-BR')} - ${endDateLocal.toLocaleDateString('pt-BR')}`
                  })()})
                </span>
              )}
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(value) => {
                    try {
                      // Tentar parsear a data no formato pt-BR (dd/mm/yyyy)
                      const parts = value.split('/')
                      if (parts.length === 3) {
                        return `${parts[0]}/${parts[1]}`
                      }
                      // Se não estiver no formato esperado, tentar parsear como ISO
                      const date = new Date(value)
                      if (!isNaN(date.getTime())) {
                        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                      }
                      return value
                    } catch {
                      return value
                    }
                  }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: number) => 
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(value)
                  }
                />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Receita" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" name="Despesa" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Últimas Transações</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Descrição</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Tipo</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Valor</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.slice(0, 10).map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">{transaction.description}</td>
                      <td className="py-4 px-6 text-sm">
                        <span
                          className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${
                            transaction.type === "income"
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "bg-red-100 text-red-700 border border-red-300"
                          }`}
                        >
                          {transaction.type === "income" ? "Receita" : "Despesa"}
                        </span>
                      </td>
                      <td
                        className={`py-4 px-6 text-sm font-bold ${
                          transaction.type === "income" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}{" "}
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(transaction.amount)}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          {new Date(transaction.date).toLocaleDateString("pt-BR")}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content - Lançamentos */}
      {tabMode === "lancamentos" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Novo Lançamento</h3>

            {/* Success Message */}
            {formSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-green-600" size={20} />
                  <p className="text-green-700 font-medium">Lançamento registrado com sucesso!</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormSuccess(false)}
                  className="text-green-600 hover:text-green-800"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Error Message */}
            {formError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-red-600" size={20} />
                  <p className="text-red-700 font-medium">{formError}</p>
                </div>
                <button type="button" onClick={() => setFormError("")} className="text-red-600 hover:text-red-800">
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
                    <span className="ml-2 text-sm font-medium text-gray-700">Receita</span>
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
                    <span className="ml-2 text-sm font-medium text-gray-700">Despesa</span>
                  </label>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {formLoading ? "Registrando..." : "Registrar Lançamento"}
            </button>
          </form>

          {/* Recent Lancamentos */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h3 className="text-xl font-bold text-gray-900">Últimos Lançamentos</h3>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        filterType === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setFilterType('income')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        filterType === 'income'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Receitas
                    </button>
                    <button
                      onClick={() => setFilterType('expense')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        filterType === 'expense'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Despesas
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {loadingTransactions ? (
              <div className="p-12 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm">Carregando lançamentos...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Nenhum lançamento encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Descrição</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Tipo</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Categoria</th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-900">Valor</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.slice(0, 20).map((transaction) => (
                      <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-sm font-medium text-gray-900">{transaction.description}</td>
                        <td className="py-4 px-6 text-sm">
                          <span
                            className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${
                              transaction.type === "income"
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : "bg-red-100 text-red-700 border border-red-300"
                            }`}
                          >
                            {transaction.type === "income" ? "Receita" : "Despesa"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{transaction.category || "-"}</td>
                        <td
                          className={`py-4 px-6 text-sm font-bold text-right ${
                            transaction.type === "income" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}{" "}
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(transaction.amount)}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            {new Date(transaction.date).toLocaleDateString("pt-BR")}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content - Stats */}
      {tabMode === "stats" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Distribuição Receita vs Despesa</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.income : COLORS.expense} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(value)
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Resumo Financeiro</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Total Receitas</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(data.totalIncome)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-gray-900">Total Despesas</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(data.totalExpenses)}
                  </span>
                </div>
                <div className={`flex items-center justify-between p-4 rounded-xl border ${
                  balance >= 0 
                    ? 'bg-blue-50 border-blue-100' 
                    : 'bg-orange-50 border-orange-100'
                }`}>
                  <div className="flex items-center gap-3">
                    <DollarSign className={`w-5 h-5 ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                    <span className="font-medium text-gray-900">Saldo</span>
                  </div>
                  <span className={`text-xl font-bold ${
                    balance >= 0 ? 'text-blue-900' : 'text-orange-900'
                  }`}>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Math.abs(balance))}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Total Transações</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">{transactions.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
