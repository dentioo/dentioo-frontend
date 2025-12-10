'use client'

import { useState, useEffect } from "react"
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  CalendarDays,
  List,
  BarChart3,
  TrendingUp,
  Filter,
  ArrowRight
} from "lucide-react"
import { useRouter } from "next/navigation"
import { QuickAppointmentModal } from "@/components/agenda/quick-appointment-modal"
import { formatTime, formatDateShort } from "@/lib/date-utils"

type ViewMode = "day" | "week" | "month"
type TabMode = "agenda" | "lista" | "stats"

interface Appointment {
  id: string
  patient_name: string
  start_time: string
  end_time: string
  title: string
  status: "scheduled" | "cancelled" | "completed"
}

/* ============================================
   BACKUP DO CÓDIGO ANTERIOR (COMENTADO)
   ============================================
   
'use client'

import { PageHeader } from "@/components/ui/page-header"
import { AgendaView } from "@/components/agenda/agenda-view"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function AgendaPage() {
  return (
    <>
      <PageHeader
        title="Agenda"
        description="Visualize e gerencie seus agendamentos"
        action={
          <Link href="/dashboard/agenda/novo" className="btn-primary flex items-center gap-2 cursor-pointer">
            <Plus size={20} />
            Novo Agendamento
          </Link>
        }
      />

      <AgendaView />
    </>
  )
}

   ============================================
   FIM DO BACKUP
   ============================================ */

export default function AgendaPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [tabMode, setTabMode] = useState<TabMode>("agenda")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [searchFilter, setSearchFilter] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          router.replace("/login")
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const response = await fetch(`${apiUrl}/api/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            router.replace("/login")
            return
          }
          throw new Error("Erro ao carregar agendamentos")
        }

        const result = await response.json()
        setAppointments(result.data || [])
        setLoading(false)
      } catch (err) {
        console.error("Erro ao carregar agendamentos:", err)
        setError("Erro ao carregar dados")
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [router])

  const refreshAppointments = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        router.replace("/login")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.replace("/login")
          return
        }
        throw new Error("Erro ao carregar agendamentos")
      }

      const result = await response.json()
      setAppointments(result.data || [])
    } catch (err) {
      console.error("Erro ao atualizar agendamentos:", err)
    }
  }

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-800 border-blue-300",
    completed: "bg-green-100 text-green-800 border-green-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
  }

  const statusLabels: Record<string, string> = {
    scheduled: "Agendado",
    completed: "Concluído",
    cancelled: "Cancelado",
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getStats = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.start_time)
      aptDate.setHours(0, 0, 0, 0)
      return aptDate.getTime() === today.getTime()
    })

    const thisWeek = appointments.filter(apt => {
      const aptDate = new Date(apt.start_time)
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      return aptDate >= weekStart && aptDate <= weekEnd
    })

    return {
      total: appointments.length,
      today: todayAppointments.length,
      thisWeek: thisWeek.length,
      scheduled: appointments.filter(a => a.status === 'scheduled').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
    }
  }

  const stats = getStats()

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-gray-50 p-3 min-h-32 border border-gray-100"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const dayAppointments = appointments.filter((apt) => apt.start_time.split("T")[0] === dateStr)
      const isToday =
        new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()

      days.push(
        <div
          key={day}
          className={`border border-gray-200 p-3 min-h-32 cursor-pointer hover:bg-blue-50 transition-all ${
            isToday ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300" : "bg-white"
          }`}
          onClick={() => {
            const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            setSelectedDate(dateObj)
            setSelectedAppointment(null)
            setShowModal(true)
          }}
        >
          <p className={`font-bold mb-2 text-lg ${isToday ? "text-blue-600" : "text-gray-900"}`}>{day}</p>
          <div className="space-y-1">
            {dayAppointments.slice(0, 3).map((apt) => (
              <div
                key={apt.id}
                className={`text-xs p-1.5 rounded-lg border cursor-pointer hover:shadow-md transition-all ${statusColors[apt.status as keyof typeof statusColors] || "bg-blue-100 text-blue-800"}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedAppointment(apt)
                  setShowModal(true)
                }}
              >
                <p className="font-semibold truncate">
                  {formatTime(apt.start_time)}
                </p>
                <p className="truncate font-medium">{apt.patient_name}</p>
              </div>
            ))}
            {dayAppointments.length > 3 && (
              <p className="text-xs text-gray-500 font-medium">+{dayAppointments.length - 3} mais</p>
            )}
          </div>
        </div>,
      )
    }

    return days
  }

  const renderListView = () => {
    const filteredAppointments = appointments.filter((apt) =>
      apt.patient_name.toLowerCase().includes(searchFilter.toLowerCase())
    )

    filteredAppointments.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

    return (
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-12 text-center">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 font-semibold text-lg mb-2">
              {searchFilter ? "Nenhuma consulta encontrada" : "Nenhuma consulta agendada"}
            </p>
            {!searchFilter && (
              <button
                onClick={() => {
                  setSelectedAppointment(null)
                  setSelectedDate(null)
                  setShowModal(true)
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg mt-4"
              >
                <Plus size={20} />
                Agendar Primeira Consulta
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAppointments.map((apt, index) => (
              <div
                key={apt.id}
                className="group bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 hover:border-blue-300 cursor-pointer"
                onClick={() => {
                  setSelectedAppointment(apt)
                  setShowModal(true)
                }}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${statusColors[apt.status as keyof typeof statusColors]}`}>
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{apt.patient_name}</p>
                      <p className="text-sm text-gray-500">{apt.title}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon size={14} className="text-gray-400" />
                    <span>{formatDateShort(apt.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} className="text-gray-400" />
                    <span>
                      {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      statusColors[apt.status as keyof typeof statusColors] || "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {statusLabels[apt.status] || apt.status}
                  </span>
                  <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderWeekView = () => {
    const days = []
    const startDate = new Date(currentDate)
    startDate.setDate(startDate.getDate() - startDate.getDay())

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split("T")[0]
      const dayAppointments = appointments.filter((apt) => apt.start_time.split("T")[0] === dateStr)
      const isToday = new Date().toDateString() === date.toDateString()

      days.push(
        <div key={i} className={`border border-gray-200 ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
          <div className={`p-4 text-center ${isToday ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' : 'bg-gray-50'}`}>
            <p className="text-sm font-semibold">{["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"][i]}</p>
            <p className={`text-2xl font-bold ${isToday ? 'text-white' : 'text-gray-900'}`}>{date.getDate()}</p>
          </div>
          <div className="p-3 space-y-2 min-h-96">
            {dayAppointments.map((apt) => (
              <div
                key={apt.id}
                className={`text-xs p-2 rounded-lg border cursor-pointer hover:shadow-md transition-all ${statusColors[apt.status as keyof typeof statusColors] || "bg-blue-100 text-blue-800"}`}
                onClick={() => {
                  setSelectedAppointment(apt)
                  setShowModal(true)
                }}
              >
                <p className="font-semibold">
                  {formatTime(apt.start_time)}
                </p>
                <p className="truncate font-medium">{apt.patient_name}</p>
              </div>
            ))}
          </div>
        </div>,
      )
    }

    return days
  }

  const renderDayView = () => {
    const dateStr = currentDate.toISOString().split("T")[0]
    const dayAppointments = appointments.filter((apt) => apt.start_time.split("T")[0] === dateStr)
    
    dayAppointments.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {dayAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 font-semibold text-lg mb-2">Nenhuma consulta agendada para este dia</p>
            <button
              onClick={() => {
                setSelectedAppointment(null)
                setSelectedDate(currentDate)
                setShowModal(true)
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg mt-4"
            >
              <Plus size={20} />
              Agendar Consulta
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {dayAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedAppointment(apt)
                  setShowModal(true)
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${statusColors[apt.status as keyof typeof statusColors]}`}>
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">{apt.patient_name}</p>
                      <p className="text-gray-600 mb-2">{apt.title}</p>
                      <p className="text-sm text-gray-500">
                        {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                      statusColors[apt.status as keyof typeof statusColors] || "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {statusLabels[apt.status] || apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando agendamentos...</p>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Agenda 📅</h1>
            <p className="text-lg text-gray-600">Gerencie seus agendamentos e consultas</p>
          </div>
          <button
            onClick={() => {
              setSelectedAppointment(null)
              setSelectedDate(null)
              setShowModal(true)
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            Novo Agendamento
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900/70">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <CalendarDays className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900/70">Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              </div>
              <Clock className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900/70">Esta Semana</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-900/70">Agendados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-indigo-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-900/70">Concluídos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-900/70">Cancelados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4 overflow-x-auto">
          <button
            onClick={() => {
              setTabMode("agenda")
              setSearchFilter("")
            }}
            className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              tabMode === "agenda"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <CalendarDays size={18} />
            Agenda
          </button>
          <button
            onClick={() => {
              setTabMode("lista")
              setSearchFilter("")
            }}
            className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              tabMode === "lista"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <List size={18} />
            Lista
          </button>
          <button
            onClick={() => setTabMode("stats")}
            className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              tabMode === "stats"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <BarChart3 size={18} />
            Estatísticas
          </button>
        </div>
      </div>

      {/* Controls - Agenda Tab */}
      {tabMode === "agenda" && (
        <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const newDate = new Date(currentDate)
                  newDate.setMonth(newDate.getMonth() - 1)
                  setCurrentDate(newDate)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft size={20} className="text-gray-700" />
              </button>

              <span className="text-lg font-bold text-gray-900 min-w-48 text-center capitalize">
                {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </span>

              <button
                onClick={() => {
                  const newDate = new Date(currentDate)
                  newDate.setMonth(newDate.getMonth() + 1)
                  setCurrentDate(newDate)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronRight size={20} className="text-gray-700" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {(["day", "week", "month"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-xl font-medium transition capitalize ${
                    viewMode === mode
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {mode === "day" ? "Dia" : mode === "week" ? "Semana" : "Mês"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search - Lista Tab */}
      {tabMode === "lista" && (
        <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome do paciente..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="animate-in fade-in duration-300">
        {tabMode === "agenda" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {viewMode === "month" && (
              <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                  <div
                    key={day}
                    className="p-4 text-center font-bold text-gray-700 border-r border-gray-200 last:border-r-0"
                  >
                    {day}
                  </div>
                ))}
                {renderCalendarDays()}
              </div>
            )}

            {viewMode === "week" && (
              <div className="grid grid-cols-7">{renderWeekView()}</div>
            )}

            {viewMode === "day" && renderDayView()}
          </div>
        )}

        {tabMode === "lista" && renderListView()}

        {tabMode === "stats" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Distribuição por Status</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Agendados</span>
                      <span className="text-sm font-bold text-gray-900">{stats.scheduled}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.scheduled / stats.total) * 100 : 0}%` }}
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
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Cancelados</span>
                      <span className="text-sm font-bold text-gray-900">{stats.cancelled}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.cancelled / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Resumo Temporal</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Hoje</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stats.today}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900">Esta Semana</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stats.thisWeek}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900">Total</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Appointment Modal */}
      {showModal && (
        <QuickAppointmentModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setSelectedAppointment(null)
            setSelectedDate(null)
            refreshAppointments()
          }}
          appointment={selectedAppointment || undefined}
          selectedDate={selectedDate || undefined}
        />
      )}
    </div>
  )
}
