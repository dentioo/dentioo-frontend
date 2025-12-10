'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { 
  ArrowLeft, 
  Check, 
  CreditCard,
  Lock,
  Shield,
  Sparkles,
  Zap,
  Rocket,
  Crown,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MessageCircle
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

/* ============================================
   BACKUP DO CÓDIGO ANTERIOR (COMENTADO)
   ============================================
   
   [Código anterior comentado aqui para referência]
   
   ============================================
   FIM DO BACKUP
   ============================================ */

export default function PagamentoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planName = searchParams.get('plano')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card')
  const [showSuccess, setShowSuccess] = useState(false)

  const selectedPlan = plans.find(p => p.name.toLowerCase() === planName?.toLowerCase())

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        
        if (!token || !userStr) {
          router.replace('/login')
          return
        }

        setIsAuthorized(true)
        setIsChecking(false)
      } catch (error) {
        console.error('[PagamentoPage] Erro ao verificar autenticação:', error)
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [router])

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

  if (!isAuthorized || !selectedPlan) {
    return null
  }

  const handlePayment = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/payment/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planName: selectedPlan.name,
          price: selectedPlan.price,
          paymentMethod,
        }),
      })

      if (response.ok) {
        setShowSuccess(true)
        setTimeout(() => {
          router.push('/dashboard/insights')
        }, 2000)
      } else {
        alert('Erro ao processar pagamento. Tente novamente.')
      }
    } catch (error) {
      console.error('[PagamentoPage] Erro ao processar pagamento:', error)
      alert('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const Icon = selectedPlan.icon
  const userEmail = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.email || ''
    } catch {
      return ''
    }
  })()

  const handleWhatsAppContact = () => {
    const phoneNumber = '34998731732'
    const message = encodeURIComponent('Olá! Gostaria de solicitar um código de acesso para o plano.')
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
  }

  return (
    <DashboardLayout>
      <div className="w-full relative">
        {/* MVP Overlay - Blur e Bloqueio */}
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 max-w-lg w-full p-8 text-center animate-in zoom-in duration-300">
            {/* Ícone de Bloqueado */}
            <div className="inline-flex p-6 bg-red-100 rounded-full mb-6">
              <Lock className="w-12 h-12 text-red-600" />
            </div>
            
            {/* Título */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Produto em MVP
            </h2>
            
            {/* Mensagem Principal */}
            <p className="text-lg text-gray-700 mb-2 leading-relaxed">
              O sistema de pagamento online ainda não está disponível.
            </p>
            <p className="text-base text-gray-600 mb-6 leading-relaxed">
              Estamos em fase de desenvolvimento (MVP) e o pagamento será liberado futuramente.
            </p>
            
            {/* Mensagem sobre Código */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-900 font-medium">
                Por enquanto, solicite seu código de acesso através do nosso suporte.
              </p>
            </div>
            
            {/* Botão WhatsApp */}
            <button
              onClick={handleWhatsAppContact}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 mb-4"
            >
              <MessageCircle size={20} />
              Falar com Suporte no WhatsApp
            </button>
            
            {/* Botão Voltar */}
            <button
              onClick={() => router.back()}
              className="w-full py-3 px-6 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Voltar para Planos
            </button>
          </div>
        </div>

        {/* Conteúdo com Blur (desabilitado visualmente) */}
        <div className="blur-sm pointer-events-none opacity-50">
        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center animate-in zoom-in duration-300">
              <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Confirmado!</h2>
              <p className="text-gray-600 mb-6">Seu plano foi ativado com sucesso. Redirecionando...</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Voltar para Planos
          </button>
          
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Finalizar Assinatura 💳</h1>
            <p className="text-lg text-gray-600">Confirme os detalhes e complete seu pagamento</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Plan Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Summary Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${selectedPlan.color} shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedPlan.name}
                  </h2>
                  <p className="text-gray-600">{selectedPlan.description}</p>
                </div>
                {selectedPlan.recommended && (
                  <div className="ml-auto">
                    <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold border border-blue-300 flex items-center gap-1">
                      <Sparkles size={14} />
                      Recomendado
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold text-gray-900">
                    {selectedPlan.price.split(',')[0]}
                  </span>
                  <span className="text-2xl font-semibold text-gray-600">
                    ,{selectedPlan.price.split(',')[1]}
                  </span>
                  <span className="text-gray-500 text-lg">
                    {selectedPlan.period}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-900 mb-4">O que está incluído:</p>
                {selectedPlan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-green-100 mt-0.5">
                      <Check size={14} className="text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700 flex-1">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard size={24} />
                Método de Pagamento
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      paymentMethod === 'card' ? 'bg-blue-600' : 'bg-gray-100'
                    }`}>
                      <CreditCard className={`w-6 h-6 ${
                        paymentMethod === 'card' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="text-left">
                      <p className={`font-semibold ${
                        paymentMethod === 'card' ? 'text-blue-900' : 'text-gray-900'
                      }`}>Cartão de Crédito</p>
                      <p className="text-sm text-gray-600">Visa, Mastercard, Elo</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    paymentMethod === 'pix'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      paymentMethod === 'pix' ? 'bg-blue-600' : 'bg-gray-100'
                    }`}>
                      <Sparkles className={`w-6 h-6 ${
                        paymentMethod === 'pix' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="text-left">
                      <p className={`font-semibold ${
                        paymentMethod === 'pix' ? 'text-blue-900' : 'text-gray-900'
                      }`}>PIX</p>
                      <p className="text-sm text-gray-600">Aprovação instantânea</p>
                    </div>
                  </div>
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4 p-6 bg-gray-50 rounded-xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número do Cartão
                    </label>
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Validade
                      </label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome no Cartão
                    </label>
                    <input
                      type="text"
                      placeholder="Nome completo"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'pix' && (
                <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                    <p className="font-semibold text-gray-900">Pagamento via PIX</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Após confirmar, você receberá o QR Code para pagamento. A aprovação é instantânea após o pagamento.
                  </p>
                </div>
              )}
            </div>

            {/* Billing Info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield size={24} />
                Informações de Cobrança
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    disabled
                    value={userEmail}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 disabled:opacity-75"
                  />
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-900 font-medium mb-1">Pagamento Seguro</p>
                <p className="text-xs text-blue-800">
                  Seus dados são protegidos com criptografia SSL. Ao prosseguir, você concorda com nossos{' '}
                  <a href="#" className="font-semibold hover:underline">Termos de Serviço</a> e{' '}
                  <a href="#" className="font-semibold hover:underline">Política de Privacidade</a>.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles size={20} />
                Resumo do Pedido
              </h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedPlan.color}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-900">{selectedPlan.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{selectedPlan.price}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Período</span>
                  <span>Mensal</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Método</span>
                  <span className="capitalize">{paymentMethod === 'card' ? 'Cartão' : 'PIX'}</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-3xl font-bold text-gray-900">{selectedPlan.price}</span>
                </div>
                <p className="text-xs text-gray-500">Cobrado mensalmente</p>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 mb-3 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    Confirmar Pagamento
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <button
                onClick={() => router.back()}
                disabled={loading}
                className="w-full py-3 px-6 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Lock size={14} />
                <span>Pagamento 100% seguro</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
