"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

interface AppointmentModalProps {
  onClose: () => void
  slot: { date: string; time: string } | null
  appointments: any[]
}

export function AppointmentModal({ onClose, slot }: AppointmentModalProps) {
  const [formData, setFormData] = useState({
    patientName: "",
    patientPhone: "",
    procedure: "",
    startTime: slot?.time || "09:00",
    endTime: "09:30",
    notes: "",
    status: "agendado" as const,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Appointment created:", formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-color-primary text-white p-6 flex items-center justify-between border-b">
          <h2 className="text-xl font-bold">Nova Consulta</h2>
          <button onClick={onClose} className="p-1 hover:bg-white hover:bg-opacity-20 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-color-primary mb-1">Paciente</label>
            <input
              type="text"
              placeholder="Nome do paciente"
              value={formData.patientName}
              onChange={(e) => setFormData((prev) => ({ ...prev, patientName: e.target.value }))}
              className="w-full px-3 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-color-primary mb-1">Telefone</label>
            <input
              type="tel"
              placeholder="(11) 98765-4321"
              value={formData.patientPhone}
              onChange={(e) => setFormData((prev) => ({ ...prev, patientPhone: e.target.value }))}
              className="w-full px-3 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-color-primary mb-1">Procedimento</label>
            <input
              type="text"
              placeholder="Ex: Limpeza Dental"
              value={formData.procedure}
              onChange={(e) => setFormData((prev) => ({ ...prev, procedure: e.target.value }))}
              className="w-full px-3 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-color-primary mb-1">Início</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-color-primary mb-1">Fim</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-color-primary mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light text-sm"
            >
              <option value="agendado">Agendado</option>
              <option value="confirmado">Confirmado</option>
              <option value="concluído">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-color-primary mb-1">Anotações</label>
            <textarea
              placeholder="Observações adicionais..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-color-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-color-primary-light text-sm resize-none"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-color-neutral-light rounded-lg hover:bg-color-bg-light transition text-sm font-medium"
            >
              Cancelar
            </button>
            <button type="submit" className="flex-1 btn-primary px-4 py-2 rounded-lg text-sm font-medium">
              Agendar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
