'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { 
  Check, 
  History, 
  Calendar, 
  Crown,
  Zap,
  Rocket,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Star
} from 'lucide-react'

const plans = [
  {
    name: "Starter",
    price: "R$ 49,99",
    period: "/mês",
    description: "Para consultórios em início de atividade",
    recommended: true,
    icon: Zap,
    color: "from-blue-500 to-blue-600",
    bgColor: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    features: [
      "Até 100 pacientes",
      "Agenda básica",
      "Prontuários digitais",
      "Suporte por email",
      "1 usuário",
      "5GB de armazenamento",
    ],
  },
  {
    name: "Professional",
    price: "R$ 99,99",
    period: "/mês",
    description: "Para consultórios em expansão",
    recommended: false,
    icon: Rocket,
    color: "from-purple-500 to-purple-600",
    bgColor: "from-purple-50 to-purple-100",
    borderColor: "border-purple-200",
    features: [
      "Pacientes ilimitados",
      "Agenda avançada",
      "Prontuários digitais",
      "Orçamentos PDF",
      "Até 3 usuários",
      "50GB de armazenamento",
      "Suporte prioritário",
      "Relatórios financeiros",
    ],
  },
  {
    name: "Premium",
    price: "R$ 129,99",
    period: "/mês",
    description: "Para consultórios consolidados",
    recommended: false,
    icon: Crown,
    color: "from-yellow-500 to-orange-600",
    bgColor: "from-yellow-50 to-orange-100",
    borderColor: "border-orange-200",
    features: [
      "Tudo do Professional",
      "Usuários ilimitados",
      "Integração Google Drive",
      "Backup automático",
      "Armazenamento ilimitado",
      "Suporte 24/7",
      "API access",
      "Personalizações avançadas",
    ],
  },
]

interface ActivationHistory {
  id: string
  trial_key_id: string
  trial_key_code: string
  activated_at: string
  trial_started_at: string | null
  trial_ends_at: string | null
  status: string
}

export function PlanosPageClient() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans')
  const [activationHistory, setActivationHistory] = useState<ActivationHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        
        if (!token || !userStr) {
          router.replace('/login')
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const response = await fetch(`${apiUrl}/api/trial/status`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setCurrentPlan(data.data?.plan_name || 'Sem Plano')
        }

        setIsAuthorized(true)
        setIsChecking(false)
      } catch (error) {
        console.error('[PlanosPage] Erro ao verificar autenticação:', error)
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchActivationHistory = async () => {
    setLoadingHistory(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/trial/activation-history`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setActivationHistory(data.data || [])
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'history' && isAuthorized) {
      fetchActivationHistory()
    }
  }, [activeTab, isAuthorized])

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  const activeActivations = activationHistory.filter(a => a.status === 'active').length
  const expiredActivations = activationHistory.filter(a => a.status === 'expired').length

  return (
    <DashboardLayout>
      <div className="w-full">
        {/* Header Moderno */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Meu Plano 💎</h1>
            <p className="text-lg text-gray-600">Gerencie sua assinatura e histórico</p>
          </div>

          {/* Stats Cards */}
          {currentPlan && currentPlan !== 'Sem Plano' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-900/70">Plano Atual</p>
                    <p className="text-xl font-bold text-gray-900">{currentPlan}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900/70">Ativações Ativas</p>
                    <p className="text-xl font-bold text-gray-900">{activeActivations}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600 opacity-50" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900/70">Total de Ativações</p>
                    <p className="text-xl font-bold text-gray-900">{activationHistory.length}</p>
                  </div>
                  <History className="w-8 h-8 text-gray-600 opacity-50" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'plans'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Sparkles size={18} />
              Planos Disponíveis
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-3 font-medium border-b-2 transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <History size={18} />
              Histórico de Ativações
            </button>
          </div>
        </div>

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Escolha o Plano Ideal</h2>
              <p className="text-gray-600">Planos flexíveis para crescer com sua clínica</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan, index) => {
                const Icon = plan.icon
                const isCurrentPlan = currentPlan === plan.name
                return (
                  <div
                    key={plan.name}
                    className={`group relative overflow-hidden rounded-3xl transition-all duration-300 ${
                      plan.recommended
                        ? "bg-gradient-to-br from-blue-50 via-white to-blue-50 border-2 border-blue-500 shadow-xl scale-105"
                        : isCurrentPlan
                        ? "bg-gradient-to-br from-green-50 via-white to-green-50 border-2 border-green-500 shadow-lg"
                        : "bg-white border border-gray-200 hover:border-blue-300 hover:shadow-xl"
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Badges */}
                    {plan.recommended && (
                      <div className="absolute top-6 right-6 z-10">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                          <Star size={12} fill="currentColor" />
                          Recomendado
                        </div>
                      </div>
                    )}
                    
                    {isCurrentPlan && (
                      <div className="absolute top-6 left-6 z-10">
                        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          Seu Plano
                        </div>
                      </div>
                    )}

                    <div className="p-8">
                      {/* Icon */}
                      <div className={`mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br ${plan.color} shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Title & Description */}
                      <div className="mb-6">
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">
                          {plan.name}
                        </h3>
                        <p className="text-gray-600">
                          {plan.description}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="mb-8">
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-5xl font-bold text-gray-900">
                            {plan.price.split(',')[0]}
                          </span>
                          <span className="text-2xl font-semibold text-gray-600">
                            ,{plan.price.split(',')[1]}
                          </span>
                          {plan.period && (
                            <span className="text-gray-500 text-lg">
                              {plan.period}
                            </span>
                          )}
                        </div>
                        
                        {isCurrentPlan ? (
                          <button
                            disabled
                            className="w-full py-3 px-6 rounded-xl font-bold bg-green-100 text-green-700 cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 size={20} />
                            Plano Atual
                          </button>
                        ) : (
                          <a
                            href={`/planos/pagamento?plano=${plan.name.toLowerCase()}`}
                            className={`group/btn w-full py-3 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                              plan.recommended
                                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
                                : "bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg"
                            }`}
                          >
                            Escolher Plano
                            <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                          </a>
                        )}
                      </div>

                      {/* Features */}
                      <div className="space-y-4 pt-6 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-900 mb-4">O que está incluído:</p>
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className={`p-1 rounded-full bg-green-100 mt-0.5`}>
                              <Check size={14} className="text-green-600" />
                            </div>
                            <span className="text-sm text-gray-700 flex-1">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Decorative Elements */}
                    {plan.recommended && (
                      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500"></div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Histórico de Ativações</h2>
              <p className="text-gray-600">Veja todas as chaves de trial que você ativou</p>
            </div>

            {loadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando histórico...</p>
                </div>
              </div>
            ) : activationHistory.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                  <History className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-700 font-semibold text-lg mb-2">Nenhuma ativação encontrada</p>
                <p className="text-gray-500">Você ainda não ativou nenhuma chave de trial</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activationHistory.map((activation, index) => {
                  const isActive = activation.status === 'active'
                  const isExpired = activation.status === 'expired'
                  
                  return (
                    <div
                      key={activation.id}
                      className={`group bg-white rounded-2xl border p-6 hover:shadow-lg transition-all duration-300 ${
                        isActive
                          ? 'border-green-200 bg-gradient-to-br from-green-50/50 to-white'
                          : isExpired
                          ? 'border-red-200 bg-gradient-to-br from-red-50/50 to-white'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${
                              isActive ? 'bg-green-100' : isExpired ? 'bg-red-100' : 'bg-gray-100'
                            }`}>
                              {isActive ? (
                                <CheckCircle2 className={`w-5 h-5 ${isActive ? 'text-green-600' : ''}`} />
                              ) : isExpired ? (
                                <XCircle className="w-5 h-5 text-red-600" />
                              ) : (
                                <Clock className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <code className="font-mono text-sm font-bold text-gray-900">
                                {activation.trial_key_code}
                              </code>
                              <span
                                className={`ml-3 inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                  isActive
                                    ? 'bg-green-100 text-green-700 border border-green-300'
                                    : isExpired
                                    ? 'bg-red-100 text-red-700 border border-red-300'
                                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                                }`}
                              >
                                {isActive ? 'Ativo' : isExpired ? 'Expirado' : 'Inativo'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar size={14} className="text-gray-400" />
                              <span>
                                <span className="font-medium">Ativada:</span>{' '}
                                {new Date(activation.activated_at).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            {activation.trial_started_at && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock size={14} className="text-gray-400" />
                                <span>
                                  <span className="font-medium">Início:</span>{' '}
                                  {new Date(activation.trial_started_at).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            )}
                            {activation.trial_ends_at && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock size={14} className="text-gray-400" />
                                <span>
                                  <span className="font-medium">Expira:</span>{' '}
                                  {new Date(activation.trial_ends_at).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

