'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SubscriptionStatusComponent from '@/components/trial/subscription-status'
import { QuickAppointmentModal } from '@/components/agenda/quick-appointment-modal'
import { CountdownTimer } from '@/components/trial/countdown-timer'
import { 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Plus,
  ArrowRight,
  Sparkles,
  BarChart3,
  FileText
} from 'lucide-react'

type TabType = 'overview' | 'stats' | 'activity'

interface DashboardData {
  user: {
    id: string
    email: string
    full_name: string
    clinic_name: string
  }
  stats: {
    total_patients: number
    appointments_this_week: number
    pending_payments: number
  }
  upcoming_appointments: any[]
}

/* ============================================
   BACKUP DO CÓDIGO ANTERIOR (COMENTADO)
   ============================================
   
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SubscriptionStatusComponent from '@/components/trial/subscription-status'
import { QuickAppointmentModal } from '@/components/agenda/quick-appointment-modal'
import { CountdownTimer } from '@/components/trial/countdown-timer'
import { Calendar, Users, Clock } from 'lucide-react'

interface DashboardData {
  user: {
    id: string
    email: string
    full_name: string
    clinic_name: string
  }
  stats: {
    total_patients: number
    appointments_this_week: number
    pending_payments: number
  }
  upcoming_appointments: any[]
}

export default function InsightsPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token')

        if (!token) {
          router.replace('/login')
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const response = await fetch(`${apiUrl}/api/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            router.replace('/login')
            return
          }
          throw new Error('Erro ao carregar insights')
        }

        const result = await response.json()
        setData(result.data)
        
        // Buscar status do trial para mostrar contagem regressiva
        const trialResponse = await fetch(`${apiUrl}/api/trial/status`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        if (trialResponse.ok) {
          const trialData = await trialResponse.json()
          if (trialData.data?.subscription?.trial_ends_at) {
            setTrialEndsAt(trialData.data.subscription.trial_ends_at)
          }
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Erro ao carregar insights:', err)
        setError('Erro ao carregar dados')
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bem-vindo, {data?.user?.full_name?.split(' ')[0] || 'Usuário'}!
        </h1>
        <p className="text-gray-600 mt-1">
          {data?.user?.clinic_name || 'Sua Clínica'}
        </p>
        {trialEndsAt && (
          <div className="mt-3">
            <CountdownTimer 
              endDate={trialEndsAt} 
              className="text-sm"
            />
          </div>
        )}
      </div>

      <SubscriptionStatusComponent />

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total de Pacientes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {data?.stats?.total_patients ?? 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Agendamentos Esta Semana</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {data?.stats?.appointments_this_week ?? 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pagamentos Pendentes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {data?.stats?.pending_payments ?? 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => router.push('/dashboard/pacientes')}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition cursor-pointer"
          >
            + Novo Paciente
          </button>
          <button
            onClick={() => router.push('/dashboard/agenda')}
            className="px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition cursor-pointer"
          >
            + Agendar Consulta
          </button>
          <button
            onClick={() => router.push('/dashboard/financeiro')}
            className="px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition cursor-pointer"
          >
            💰 Financeiro
          </button>
        </div>
      </div>

      {data?.upcoming_appointments && data.upcoming_appointments.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximos Agendamentos</h2>
          <div className="space-y-3">
            {data.upcoming_appointments.slice(0, 5).map((apt: any) => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{apt.patient_name}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(apt.start_time).toLocaleDateString('pt-BR')} às {new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                  {apt.title}
                </span>
              </div>
            ))}
          </div>
          {data.upcoming_appointments.length > 5 && (
            <button
              onClick={() => router.push('/dashboard/agenda')}
              className="mt-4 w-full py-2 text-blue-600 font-medium hover:text-blue-700"
            >
              Ver Todos os Agendamentos
            </button>
          )}
        </div>
      )}

      {data?.upcoming_appointments && data.upcoming_appointments.length === 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-4">Nenhum agendamento próximo</p>
          <button
            onClick={() => setShowAppointmentModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer"
          >
            Agendar Primeira Consulta
          </button>
        </div>
      )}

      <QuickAppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
      />
    </div>
  )
}

   ============================================
   FIM DO BACKUP
   ============================================ */

export default function InsightsPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token')

        if (!token) {
          router.replace('/login')
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const response = await fetch(`${apiUrl}/api/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            router.replace('/login')
            return
          }
          throw new Error('Erro ao carregar insights')
        }

        const result = await response.json()
        setData(result.data)
        
        const trialResponse = await fetch(`${apiUrl}/api/trial/status`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        if (trialResponse.ok) {
          const trialData = await trialResponse.json()
          if (trialData.data?.subscription?.trial_ends_at) {
            setTrialEndsAt(trialData.data.subscription.trial_ends_at)
          }
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Erro ao carregar insights:', err)
        setError('Erro ao carregar dados')
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
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

  const tabs = [
    { id: 'overview' as TabType, label: 'Visão Geral', icon: Sparkles },
    { id: 'stats' as TabType, label: 'Estatísticas', icon: BarChart3 },
    { id: 'activity' as TabType, label: 'Atividades', icon: Activity },
  ]

  return (
    <div className="w-full">
      {/* Welcome Badge */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border border-blue-200/50 rounded-full shadow-sm">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Bem-vindo ao Dentioo!
          </span>
        </div>
      </div>

      {/* Header Moderno */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Olá, {data?.user?.full_name?.split(' ')[0] || 'Usuário'}! 👋
            </h1>
            <p className="text-lg text-gray-600">
              {data?.user?.clinic_name || 'Sua Clínica'}
            </p>
          </div>
          {trialEndsAt && (
            <div className="hidden md:block">
              <CountdownTimer 
                endDate={trialEndsAt} 
                className="text-sm bg-blue-50 px-4 py-2 rounded-lg border border-blue-200"
              />
            </div>
          )}
        </div>
        {trialEndsAt && (
          <div className="md:hidden mt-4">
            <CountdownTimer 
              endDate={trialEndsAt} 
              className="text-sm bg-blue-50 px-4 py-2 rounded-lg border border-blue-200"
            />
          </div>
        )}
      </div>

      {/* Status da Subscription */}
      <div className="mb-8">
        <SubscriptionStatusComponent />
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <div className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Stats Cards Modernos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total de Pacientes */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm font-medium text-blue-900/70 mb-1">Total de Pacientes</p>
                <p className="text-4xl font-bold text-gray-900">
                  {data?.stats?.total_patients ?? 0}
                </p>
                <div className="mt-4 flex items-center text-sm text-blue-700">
                  <TrendingUp size={14} className="mr-1" />
                  <span>Base de clientes</span>
                </div>
              </div>
            </div>

            {/* Agendamentos Esta Semana */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm font-medium text-green-900/70 mb-1">Agendamentos Esta Semana</p>
                <p className="text-4xl font-bold text-gray-900">
                  {data?.stats?.appointments_this_week ?? 0}
                </p>
                <div className="mt-4 flex items-center text-sm text-green-700">
                  <Activity size={14} className="mr-1" />
                  <span>Esta semana</span>
                </div>
              </div>
            </div>

            {/* Pagamentos Pendentes */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-sm font-medium text-orange-900/70 mb-1">Pagamentos Pendentes</p>
                <p className="text-4xl font-bold text-gray-900">
                  {data?.stats?.pending_payments ?? 0}
                </p>
                <div className="mt-4 flex items-center text-sm text-orange-700">
                  <Clock size={14} className="mr-1" />
                  <span>Requer atenção</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Modernas */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Ações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/dashboard/pacientes')}
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Users size={20} />
                  </div>
                  <span>Novo Paciente</span>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/dashboard/agenda')}
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Calendar size={20} />
                  </div>
                  <span>Agendar Consulta</span>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/dashboard/financeiro')}
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <DollarSign size={20} />
                  </div>
                  <span>Financeiro</span>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Próximos Agendamentos */}
          {data?.upcoming_appointments && data.upcoming_appointments.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Próximos Agendamentos</h2>
                <button
                  onClick={() => router.push('/dashboard/agenda')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  Ver todos
                  <ArrowRight size={16} />
                </button>
              </div>
              <div className="space-y-3">
                {data.upcoming_appointments.slice(0, 5).map((apt: any, index: number) => (
                  <div
                    key={apt.id}
                    className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{apt.patient_name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(apt.start_time).toLocaleDateString('pt-BR', { 
                            weekday: 'short',
                            day: '2-digit', 
                            month: 'short' 
                          })} às {new Date(apt.start_time).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    <span className="px-4 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                      {apt.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {data?.upcoming_appointments && data.upcoming_appointments.length === 0 && (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-700 font-semibold text-lg mb-2">Nenhum agendamento próximo</p>
              <p className="text-gray-500 mb-6">Comece agendando sua primeira consulta</p>
              <button
                onClick={() => setShowAppointmentModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                <Plus size={20} />
                Agendar Primeira Consulta
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Estatísticas Detalhadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Pacientes</h3>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {data?.stats?.total_patients ?? 0}
                </p>
                <p className="text-sm text-gray-600">Total cadastrado</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Agendamentos</h3>
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {data?.stats?.appointments_this_week ?? 0}
                </p>
                <p className="text-sm text-gray-600">Esta semana</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Financeiro</h3>
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {data?.stats?.pending_payments ?? 0}
                </p>
                <p className="text-sm text-gray-600">Pendentes</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Próximos</h3>
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {data?.upcoming_appointments?.length ?? 0}
                </p>
                <p className="text-sm text-gray-600">Agendamentos</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {data?.upcoming_appointments && data.upcoming_appointments.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Atividades Recentes</h2>
              <div className="space-y-4">
                {data.upcoming_appointments.map((apt: any, index: number) => (
                  <div
                    key={apt.id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg mt-1">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{apt.patient_name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {apt.title} • {new Date(apt.start_time).toLocaleDateString('pt-BR')} às {new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Nenhuma atividade recente</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Appointment Modal */}
      <QuickAppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
      />
    </div>
  )
}
