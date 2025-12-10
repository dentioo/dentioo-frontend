'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PatientSelect } from "@/components/ui/patient-select"

export function AppointmentForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patient_id: "",
    title: "",
    start_time: "",
    end_time: "",
    notes: "",
    status: "scheduled",
  })

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
      const response = await fetch(`${apiUrl}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
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

      router.push("/dashboard/agenda")
    } catch (err) {
      console.error("Erro ao criar agendamento:", err)
      alert("Erro ao criar agendamento")
    } finally {
      setLoading(false)
    }
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
            required
          />
        </div>

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

        <div className="flex gap-4 pt-6">
          <Link
            href="/dashboard/agenda"
            className="flex items-center gap-2 px-6 py-2 border border-color-neutral-light rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            <ArrowLeft size={18} />
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition disabled:opacity-50 cursor-pointer"
          >
            <Save size={18} />
            {loading ? "Salvando..." : "Salvar Agendamento"}
          </button>
        </div>
      </form>
    </div>
  )
}
