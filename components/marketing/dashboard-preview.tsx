'use client'

import { useState } from 'react'
import { Users, Calendar, DollarSign, TrendingUp, Clock, FileText, ArrowRight } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

// Dados mockados para o preview
const mockStats = {
  totalPatients: 127,
  appointmentsThisWeek: 24,
  pendingPayments: 8,
  totalRevenue: 45230,
}

const mockAppointments = [
  { id: 1, patient: 'Maria Silva', time: '09:00', type: 'Consulta' },
  { id: 2, patient: 'João Santos', time: '10:30', type: 'Limpeza' },
  { id: 3, patient: 'Ana Costa', time: '14:00', type: 'Ortodontia' },
]

const mockRevenueData = [
  { month: 'Jan', receita: 12000, despesa: 8000 },
  { month: 'Fev', receita: 15000, despesa: 9000 },
  { month: 'Mar', receita: 18000, despesa: 10000 },
  { month: 'Abr', receita: 22000, despesa: 11000 },
  { month: 'Mai', receita: 25000, despesa: 12000 },
  { month: 'Jun', receita: 28000, despesa: 13000 },
]

export function DashboardPreview() {
  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'appointments'>('overview')

  return (
    <div className="w-full h-full">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-2 px-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'finance'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Financeiro
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'appointments'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Agenda
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{mockStats.totalPatients}</p>
                <p className="text-xs text-gray-600 mt-1">Pacientes</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{mockStats.appointmentsThisWeek}</p>
                <p className="text-xs text-gray-600 mt-1">Esta Semana</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {mockStats.totalRevenue.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-gray-600 mt-1">Receita Total</p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Receita vs Despesa</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={mockRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Novo Paciente</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Agendar</span>
              </button>
            </div>
          </>
        )}

        {activeTab === 'finance' && (
          <>
            {/* Finance Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <p className="text-xs text-gray-600 mb-1">Receita do Mês</p>
                <p className="text-2xl font-bold text-gray-900">R$ 28.000</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">+12%</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                <p className="text-xs text-gray-600 mb-1">Despesas do Mês</p>
                <p className="text-2xl font-bold text-gray-900">R$ 13.000</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                  <span className="text-xs text-red-600 font-medium">-5%</span>
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Evolução Financeira</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={mockRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="despesa" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pending Payments */}
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Pagamentos Pendentes</p>
                    <p className="text-xs text-gray-600">{mockStats.pendingPayments} pendências</p>
                  </div>
                </div>
                <button className="text-xs text-orange-600 font-medium hover:text-orange-700">
                  Ver todos
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'appointments' && (
          <>
            {/* Today's Appointments */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Agendamentos de Hoje</h3>
              {mockAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{apt.patient}</p>
                      <p className="text-xs text-gray-600">{apt.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{apt.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Schedule */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Agende uma consulta</p>
                  <p className="text-xs text-gray-600">Gerencie sua agenda de forma inteligente</p>
                </div>
                <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-600 mb-1">Esta Semana</p>
                <p className="text-xl font-bold text-gray-900">{mockStats.appointmentsThisWeek}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-600 mb-1">Este Mês</p>
                <p className="text-xl font-bold text-gray-900">89</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CTA Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600">Experimente todas as funcionalidades</p>
          <button className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
            Começar agora
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

