"use client"

import { Check, Sparkles, Zap, Crown, Rocket, ArrowRight } from "lucide-react"
import Link from "next/link"

/* ============================================
   BACKUP DO CÓDIGO ANTERIOR (COMENTADO)
   ============================================
   
   [Código anterior comentado aqui para referência]
   
   ============================================
   FIM DO BACKUP
   ============================================ */

const plans = [
  {
    name: "Free",
    price: "Grátis",
    period: "",
    description: "14 dias gratuitos para começar",
    recommended: false,
    icon: Zap,
    gradient: "from-gray-400 to-gray-600",
    features: [
      "Até 10 pacientes",
      "Agenda básica",
      "Prontuários digitais",
      "1 usuário",
      "1GB de armazenamento",
      "Suporte por email",
    ],
    cta: "Começar agora",
  },
  {
    name: "Starter",
    price: "R$ 49,99",
    period: "/mês",
    description: "Para consultórios em início de atividade",
    recommended: true,
    icon: Rocket,
    gradient: "from-blue-500 to-cyan-500",
    features: [
      "Até 100 pacientes",
      "Agenda básica",
      "Prontuários digitais",
      "Suporte por email",
      "1 usuário",
      "5GB de armazenamento",
    ],
    cta: "Começar agora",
  },
  {
    name: "Professional",
    price: "R$ 99,99",
    period: "/mês",
    description: "Para consultórios em expansão",
    recommended: false,
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-500",
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
    cta: "Começar agora",
  },
  {
    name: "Premium",
    price: "R$ 129,99",
    period: "/mês",
    description: "Para consultórios consolidados",
    recommended: false,
    icon: Crown,
    gradient: "from-yellow-500 to-orange-500",
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
    cta: "Começar agora",
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="relative w-full overflow-hidden bg-gradient-to-b from-white via-gray-50/30 to-white py-20 lg:py-32">
      {/* Decorative elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl -z-10"></div>
      
      <div className="relative max-w-[100rem] mx-auto px-3 sm:px-3 lg:px-4">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200/50">
            <Sparkles size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-800">Preços</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Planos{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Simples e Transparentes
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal para sua clínica. Sem surpresas, sem taxas ocultas.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <div 
                key={plan.name} 
                className="relative group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`h-full rounded-3xl p-8 transition-all duration-500 relative ${
                    plan.recommended
                      ? "bg-gradient-to-br from-blue-50 via-white to-purple-50 border-2 border-blue-300 shadow-2xl"
                      : "bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-xl"
                  }`}
                >
                  {/* Recommended Badge */}
                  {plan.recommended && (
                    <div className="absolute top-6 right-6 z-10">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                        <Sparkles size={12} />
                        Recomendado
                      </div>
                    </div>
                  )}
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${plan.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="text-white" size={28} />
                  </div>

                  {/* Plan Info */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      {plan.description}
                    </p>

                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">
                        {plan.price.split(',')[0]}
                      </span>
                      {plan.price.includes(',') && (
                        <span className="text-2xl font-semibold text-gray-600">
                          ,{plan.price.split(',')[1]}
                        </span>
                      )}
                      {plan.period && (
                        <span className="text-gray-600 text-lg">
                          {plan.period}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href="/cadastro"
                    className={`group/btn block text-center py-4 px-6 rounded-xl font-semibold mb-8 transition-all duration-300 ${
                      plan.recommended
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {plan.cta}
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </Link>

                  {/* Features */}
                  <div className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`p-1 rounded-full bg-gradient-to-br ${plan.gradient} mt-0.5`}>
                          <Check size={14} className="text-white" />
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Trust Badge */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 mb-4">✓ Sem compromisso • ✓ Cancele quando quiser • ✓ Suporte 24/7</p>
        </div>
      </div>
    </section>
  )
}
