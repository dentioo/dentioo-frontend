import { Calendar, Users, FileText, ArrowRight, Sparkles, Zap, Shield } from "lucide-react"
import Link from "next/link"

/* ============================================
   BACKUP DO CÓDIGO ANTERIOR (COMENTADO)
   ============================================
   
   [Código anterior comentado aqui para referência]
   
   ============================================
   FIM DO BACKUP
   ============================================ */

const benefits = [
  {
    icon: Calendar,
    title: "Agenda Inteligente",
    description: "Gestão completa de consultas com visualizações por dia, semana e mês. Sincronize com seu calendário pessoal e nunca perca um compromisso.",
    slug: "agenda-inteligente",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
    color: "blue",
  },
  {
    icon: Users,
    title: "Cadastro de Pacientes",
    description: "Armazene todos os dados dos seus pacientes em um único lugar seguro com histórico completo de atendimentos e tratamentos.",
    slug: "cadastro-pacientes",
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
    color: "purple",
  },
  {
    icon: FileText,
    title: "Prontuário Digital",
    description: "Prontuários eletrônicos seguros e completos com anotações, diagnósticos, planos de tratamento e histórico médico.",
    slug: "prontuario-digital",
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-50",
    color: "green",
  },
]

export function BenefitsSection() {
  return (
    <section id="features" className="relative w-full overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl -z-10"></div>
      
      <div className="relative max-w-[100rem] mx-auto px-3 sm:px-3 lg:px-4">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200/50">
            <Sparkles size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-800">Funcionalidades</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Tudo que você precisa em{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              um só lugar
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Funcionalidades completas e intuitivas para gerenciar sua clínica de forma eficiente e profissional
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={benefit.title}
                className="group relative bg-white rounded-3xl p-8 border border-gray-200 hover:border-transparent transition-all duration-500 shadow-sm hover:shadow-2xl overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Animated glow effect */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${benefit.gradient} rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-3xl`}></div>
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${benefit.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-all duration-500`}>
                    <Icon className="text-white" size={28} />
                  </div>
                  
                  {/* Content */}
                  <h3 className={`text-2xl font-bold mb-3 text-gray-900 group-hover:bg-gradient-to-r group-hover:${benefit.gradient} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300`}>
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors duration-300">
                    {benefit.description}
                  </p>
                  
                  {/* CTA Link */}
                  <Link 
                    href={`/home/${benefit.slug}`} 
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 group-hover:text-blue-600 transition-all duration-300 opacity-0 group-hover:opacity-100"
                  >
                    <span>Saiba mais</span>
                    <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              </div>
            )
          })}
        </div>

        {/* Additional Features Banner */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Rápido e Eficiente</h3>
                <p className="text-blue-100 text-sm">Interface intuitiva que acelera seu trabalho diário</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">100% Seguro</h3>
                <p className="text-blue-100 text-sm">Seus dados protegidos com criptografia de nível bancário</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Sempre Atualizado</h3>
                <p className="text-blue-100 text-sm">Novas funcionalidades adicionadas regularmente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
