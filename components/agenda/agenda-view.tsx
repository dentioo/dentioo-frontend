"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { QuickAppointmentModal } from "./quick-appointment-modal"
import { formatTime } from "@/lib/date-utils"

type ViewMode = "day" | "week" | "month"
type TabMode = "agenda" | "lista"

interface Appointment {
  id: string
  patient_name: string
  start_time: string
  end_time: string
  title: string
  status: "scheduled" | "cancelled" | "completed"
}

export function AgendaView() {
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
        // Erro silencioso
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

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-gray-50 p-3 min-h-24"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const dayAppointments = appointments.filter((apt) => apt.start_time.split("T")[0] === dateStr)
      const isToday =
        new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()

      days.push(
        <div
          key={day}
          className={`border border-color-neutral-light p-3 min-h-24 cursor-pointer hover:bg-color-bg-light transition ${isToday ? "bg-color-primary-light bg-opacity-5" : "bg-white"}`}
          onClick={() => {
            const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            setSelectedDate(dateObj)
            setSelectedAppointment(null)
            setShowModal(true)
          }}
        >
          <p className={`font-semibold mb-1 ${isToday ? "text-color-primary" : "text-gray-900"}`}>{day}</p>
          <div className="space-y-1">
            {dayAppointments.slice(0, 2).map((apt) => (
              <div
                key={apt.id}
                className={`text-xs p-1 rounded border cursor-pointer hover:shadow-md transition ${statusColors[apt.status as keyof typeof statusColors] || "bg-blue-100 text-blue-800"}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedAppointment(apt)
                  setShowModal(true)
                }}
              >
                <p className="font-medium truncate">
                  {new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="truncate">{apt.patient_name}</p>
              </div>
            ))}
            {dayAppointments.length > 2 && <p className="text-xs text-gray-500">+{dayAppointments.length - 2} mais</p>}
          </div>
        </div>,
      )
    }

    return days
  }

  const renderListView = () => {
    // Filtrar por nome do paciente
    const filteredAppointments = appointments.filter((apt) =>
      apt.patient_name.toLowerCase().includes(searchFilter.toLowerCase())
    )

    // Ordenar por data e hora
    filteredAppointments.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

    return (
      <div className="space-y-4">
        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Filtrar por nome do paciente..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary"
          />
        </div>

        {/* List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-color-neutral-light p-8 text-center text-gray-500">
            <p>{searchFilter ? "Nenhuma consulta encontrada com este filtro" : "Nenhuma consulta agendada"}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white border border-color-neutral-light rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                onClick={() => {
                  setSelectedAppointment(apt)
                  setShowModal(true)
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{apt.patient_name}</p>
                    <p className="text-sm text-gray-600 mt-1">{apt.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(apt.start_time).toLocaleDateString('pt-BR')} às{" "}
                      {new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ml-4 ${
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

  const renderWeekView = () => {
    const days = []
    const startDate = new Date(currentDate)
    startDate.setDate(startDate.getDate() - startDate.getDay())

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split("T")[0]
      const dayAppointments = appointments.filter((apt) => apt.start_time.split("T")[0] === dateStr)

      days.push(
        <div key={i} className="border border-color-neutral-light">
          <div className="bg-color-bg-light p-3 text-center">
            <p className="text-sm font-semibold text-gray-600">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"][i]}
            </p>
            <p className="text-lg font-bold text-color-primary">{date.getDate()}</p>
          </div>
          <div className="p-2 space-y-1 min-h-96">
            {dayAppointments.map((apt) => (
              <div
                key={apt.id}
                className={`text-xs p-2 rounded border cursor-pointer hover:shadow-md transition ${statusColors[apt.status as keyof typeof statusColors] || "bg-blue-100 text-blue-800"}`}
                onClick={() => {
                  setSelectedAppointment(apt)
                  setShowModal(true)
                }}
              >
                <p className="font-medium">
                  {formatTime(apt.start_time)}
                </p>
                <p className="truncate">{apt.patient_name}</p>
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
    
    // Ordenar por horário de início
    dayAppointments.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

    return (
      <div className="bg-white rounded-xl border border-color-neutral-light overflow-hidden">
        {dayAppointments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nenhuma consulta agendada para este dia</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-color-bg-light border-b border-color-neutral-light">
                  <th className="text-left py-3 px-4 font-semibold text-color-primary">Horário</th>
                  <th className="text-left py-3 px-4 font-semibold text-color-primary">Paciente</th>
                  <th className="text-left py-3 px-4 font-semibold text-color-primary">Procedimento</th>
                  <th className="text-left py-3 px-4 font-semibold text-color-primary">Status</th>
                </tr>
              </thead>
              <tbody>
                {dayAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="border-b border-color-neutral-light hover:bg-color-bg-light transition cursor-pointer"
                    onClick={() => {
                      setSelectedAppointment(apt)
                      setShowModal(true)
                    }}
                  >
                    <td className="py-3 px-4 font-medium text-gray-700">
                      {new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">{apt.patient_name}</td>
                    <td className="py-3 px-4">{apt.title}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[apt.status as keyof typeof statusColors] || "bg-blue-100 text-blue-800"}`}
                      >
                        {statusLabels[apt.status] || apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="mb-8 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => {
              setTabMode("agenda")
              setSearchFilter("")
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              tabMode === "agenda"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Agenda
          </button>
          <button
            onClick={() => {
              setTabMode("lista")
              setSearchFilter("")
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              tabMode === "lista"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Lista
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando agendamentos...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
      {/* Controls */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-color-neutral-light flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newDate = new Date(currentDate)
              newDate.setMonth(newDate.getMonth() - 1)
              setCurrentDate(newDate)
            }}
            className="p-2 hover:bg-color-bg-light rounded-lg transition"
            disabled={tabMode === "lista"}
          >
            <ChevronLeft size={20} className="text-color-primary" />
          </button>

          <span className="text-lg font-semibold text-color-primary min-w-40 text-center">
            {tabMode === "agenda" && currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            {tabMode === "lista" && "Lista de Consultas"}
          </span>

          <button
            onClick={() => {
              const newDate = new Date(currentDate)
              newDate.setMonth(newDate.getMonth() + 1)
              setCurrentDate(newDate)
            }}
            className="p-2 hover:bg-color-bg-light rounded-lg transition"
            disabled={tabMode === "lista"}
          >
            <ChevronRight size={20} className="text-color-primary" />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View modes (apenas para agenda) */}
          {tabMode === "agenda" && (
            <div className="flex items-center gap-2 flex-wrap">
              {(["day", "week", "month"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg font-medium transition capitalize text-color-primary ${
                    viewMode === mode
                      ? "bg-blue-100"
                      : "border border-color-neutral-light"
                  }`}
                >
                  {mode === "day" ? "Dia" : mode === "week" ? "Semana" : "Mês"}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setSelectedAppointment(null)
            setSelectedDate(null)
            setShowModal(true)
          }}
          className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <Plus size={20} />
          Nova Consulta
        </button>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-xl shadow-sm border border-color-neutral-light overflow-hidden">
        {tabMode === "agenda" && (
          <>
            {viewMode === "month" && (
              <div className="grid grid-cols-7 bg-color-bg-light border-b border-color-neutral-light">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                  <div
                    key={day}
                    className="p-3 text-center font-semibold text-color-primary border-r border-color-neutral-light last:border-r-0"
                  >
                    {day}
                  </div>
                ))}
                {renderCalendarDays()}
              </div>
            )}

            {viewMode === "week" && <div className="grid grid-cols-7">{renderWeekView()}</div>}

            {viewMode === "day" && renderDayView()}
          </>
        )}

        {tabMode === "lista" && (
          <div className="p-6">
            {renderListView()}
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
        </>
      )}
    </div>
  )
}
