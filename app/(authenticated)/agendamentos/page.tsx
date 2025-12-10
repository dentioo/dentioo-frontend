'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Calendar, Plus, X, Clock } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Appointment {
  id: string
  patient_name: string
  patient_id: string
  start_time: string
  end_time: string
  title: string
  description: string
  notes: string
  status: string
}

export default function AgendamentosPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [formData, setFormData] = useState({
    patient_id: '',
    patient_name: '',
    title: '',
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 3600000).toISOString(),
    description: '',
    notes: '',
  })
  const [patients, setPatients] = useState<any[]>([])

  useEffect(() => {
    fetchAppointments()
    fetchPatients()
  }, [])

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/appointments', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!response.ok) throw new Error('Erro ao carregar agendamentos')
      const data = await response.json()
      setAppointments(data.data || [])
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/patients', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setPatients(data.data || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateAppointment = async () => {
    try {
      if (!formData.patient_id || !formData.title || !formData.start_time || !formData.end_time) {
        setError('Preencha todos os campos obrigatórios')
        return
      }

      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Erro ao criar agendamento')

      setIsModalOpen(false)
      setFormData({
        patient_id: '',
        patient_name: '',
        title: '',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
        description: '',
        notes: '',
      })
      fetchAppointments()
    } catch (err) {
      console.error(err)
      setError('Erro ao criar agendamento')
    }
  }

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!response.ok) throw new Error('Erro ao deletar agendamento')
      fetchAppointments()
    } catch (err) {
      console.error(err)
      setError('Erro ao deletar agendamento')
    }
  }

  const getWeekDates = () => {
    const today = new Date()
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  const weekDates = getWeekDates()
  const appointmentsByDate: { [key: string]: Appointment[] } = {}
  appointments.forEach((apt) => {
    const date = apt.start_time.split('T')[0]
    if (!appointmentsByDate[date]) appointmentsByDate[date] = []
    appointmentsByDate[date].push(apt)
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
            <p className="text-gray-600 mt-1">Gerencie as consultas da sua clínica</p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Calendar View - próximos 7 dias */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {weekDates.map((date) => {
            const dayDate = new Date(date)
            const dayName = dayDate.toLocaleDateString('pt-BR', { weekday: 'short' })
            const dayNum = dayDate.getDate()
            const monthName = dayDate.toLocaleDateString('pt-BR', { month: 'short' })
            const aptsForDay = appointmentsByDate[date] || []
            const isToday = date === new Date().toISOString().split('T')[0]

            return (
              <div
                key={date}
                className={`rounded-lg border p-4 ${
                  isToday
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="text-center mb-4 pb-4 border-b">
                  <p className="text-sm font-medium text-gray-600 capitalize">{dayName}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dayNum}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{monthName}</p>
                </div>

                <div className="space-y-2">
                  {aptsForDay.length > 0 ? (
                    aptsForDay.map((apt) => (
                      <div
                        key={apt.id}
                        className="bg-gray-50 p-2 rounded text-xs group hover:bg-red-50 transition"
                      >
                        <p className="font-medium text-gray-900 truncate">
                          {new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-gray-600 text-xs truncate">
                          {apt.patient_name}
                        </p>
                        <button
                          onClick={() => handleDeleteAppointment(apt.id)}
                          className="mt-1 text-red-600 text-xs hover:text-red-700 opacity-0 group-hover:opacity-100"
                        >
                          Cancelar
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-2">
                      Sem agendamentos
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Lista de Agendamentos Atual */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximos Agendamentos</h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-4">Nenhum agendamento</p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Agendar Primeira Consulta
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Paciente</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Data</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Hora</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Tipo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900 font-medium">{apt.patient_name}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(apt.start_time).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium capitalize">
                          {apt.title}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 text-sm rounded-full font-medium capitalize ${
                            apt.status === 'scheduled'
                              ? 'bg-green-100 text-green-700'
                              : apt.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteAppointment(apt.id)}
                          className="text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          Cancelar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Novo Agendamento */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>
              Preencha os dados da consulta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Seleção de Paciente */}
            <div>
              <Label className="text-sm font-medium text-gray-900">Paciente</Label>
              <select
                value={formData.patient_id}
                onChange={(e) => {
                  const patient = patients.find((p) => p.id === e.target.value)
                  setFormData({
                    ...formData,
                    patient_id: e.target.value,
                    patient_name: patient?.full_name || '',
                  })
                }}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione um paciente</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Título */}
            <div>
              <Label className="text-sm font-medium text-gray-900">Título da Consulta</Label>
              <Input
                type="text"
                placeholder="Ex: Consulta de Rotina"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="mt-1"
              />
            </div>

            {/* Data e Hora Início */}
            <div>
              <Label className="text-sm font-medium text-gray-900">Data e Hora de Início</Label>
              <Input
                type="datetime-local"
                value={formData.start_time.slice(0, 16)}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                className="mt-1"
              />
            </div>

            {/* Data e Hora Fim */}
            <div>
              <Label className="text-sm font-medium text-gray-900">Data e Hora de Término</Label>
              <Input
                type="datetime-local"
                value={formData.end_time.slice(0, 16)}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                className="mt-1"
              />
            </div>

            {/* Descrição */}
            <div>
              <Label className="text-sm font-medium text-gray-900">Descrição</Label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Adicione detalhes sobre a consulta"
              />
            </div>

            {/* Notas */}
            <div>
              <Label className="text-sm font-medium text-gray-900">Notas</Label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Observações sobre a consulta..."
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={handleCreateAppointment}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
