'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, ArrowLeft, X } from "lucide-react"
import { PatientSelect } from "@/components/ui/patient-select"
import { ConfirmModal } from "@/components/ui/confirm-modal"

interface Appointment {
  id: string
  patient_name: string
  start_time: string
  end_time: string
  title: string
  status: "scheduled" | "cancelled" | "completed"
  notes?: string
}

interface QuickAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  appointment?: Appointment
  selectedDate?: Date
}

export function QuickAppointmentModal({ isOpen, onClose, appointment, selectedDate }: QuickAppointmentModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState({
    patient_id: "",
    title: "",
    start_time: "",
    end_time: "",
    notes: "",
    status: "scheduled",
  })

  useEffect(() => {
    if (appointment) {
      setFormData({
        patient_id: "",
        title: appointment.title,
        start_time: appointment.start_time.slice(0, 16),
        end_time: appointment.end_time.slice(0, 16),
        notes: appointment.notes || "",
        status: appointment.status,
      })
    } else {
      // Gerar data e hora padrão (sempre com hora atual)
      const now = new Date()
      
      // Se tem data selecionada, usa essa data mas com a hora atual
      let year = selectedDate ? selectedDate.getFullYear() : now.getFullYear()
      let month = selectedDate ? selectedDate.getMonth() + 1 : now.getMonth() + 1
      let day = selectedDate ? selectedDate.getDate() : now.getDate()
      
      // Sempre usa a hora atual
      const hours = now.getHours()
      const minutes = now.getMinutes()

      const yearStr = String(year).padStart(4, "0")
      const monthStr = String(month).padStart(2, "0")
      const dayStr = String(day).padStart(2, "0")
      const hoursStr = String(hours).padStart(2, "0")
      const minutesStr = String(minutes).padStart(2, "0")

      const startDateTime = `${yearStr}-${monthStr}-${dayStr}T${hoursStr}:${minutesStr}`
      
      // Fim é 1 hora depois
      const endHours = String((hours + 1) % 24).padStart(2, "0")
      const endDateTime = `${yearStr}-${monthStr}-${dayStr}T${endHours}:${minutesStr}`

      setFormData({
        patient_id: "",
        title: "",
        start_time: startDateTime,
        end_time: endDateTime,
        notes: "",
        status: "scheduled",
      })
    }
  }, [appointment?.id, isOpen, selectedDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        router.replace("/login")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const url = appointment 
        ? `${apiUrl}/api/appointments/${appointment.id}`
        : `${apiUrl}/api/appointments`
      const method = appointment ? "PUT" : "POST"
      
      const { fromDateTimeLocalToUTC } = await import('@/lib/date-utils')

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          start_time: fromDateTimeLocalToUTC(formData.start_time),
          end_time: fromDateTimeLocalToUTC(formData.end_time),
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.replace("/login")
          return
        }
        throw new Error("Erro ao criar agendamento")
      }

      onClose()
    } catch (err) {
      console.error("Erro ao salvar agendamento:", err)
      alert("Erro ao salvar agendamento")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!appointment) return

    setLoading(true)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        router.replace("/login")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/appointments/${appointment.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.replace("/login")
          return
        }
        throw new Error("Erro ao deletar agendamento")
      }

      // Fechar o modal após deletar
      setShowDeleteConfirm(false)
      onClose()
    } catch (err) {
      console.error("Erro ao deletar agendamento:", err)
      alert("Erro ao deletar agendamento")
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop com blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal - Maior */}
      <div className="relative bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded transition z-10"
        >
          <X size={24} className="text-gray-600" />
        </button>

        {/* Content */}
        <div className="p-8 pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {appointment ? "Editar Consulta" : "Agendar Consulta"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!appointment && (
              <div>
                <PatientSelect
                  value={formData.patient_id}
                  onChange={(patientId) =>
                    setFormData({ ...formData, patient_id: patientId })
                  }
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Consulta de rotina"
                className="w-full px-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data e Hora de Início *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data e Hora de Término *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary"
                />
              </div>
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
                <option value="scheduled">Agendado</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Anotações sobre o agendamento..."
                rows={4}
                className="w-full px-4 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary"
              />
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-2 border border-color-neutral-light rounded-lg text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                <ArrowLeft size={18} />
                Fechar
              </button>
              {appointment && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 cursor-pointer"
                >
                  Deletar Consulta
                </button>
              )}
              {!appointment && (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 transition disabled:opacity-50 cursor-pointer"
                >
                  <Save size={18} />
                  {loading ? "Salvando..." : "Agendar Consulta"}
                </button>
              )}
              {appointment && (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 cursor-pointer ml-auto"
                >
                  <Save size={18} />
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Deletar Consulta"
        message={`Tem certeza que deseja deletar a consulta de "${appointment?.patient_name}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={loading}
        isDangerous={true}
      />
    </div>
  )
}
