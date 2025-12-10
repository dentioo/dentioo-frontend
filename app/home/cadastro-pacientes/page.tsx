'use client'

import Link from "next/link"
import { ArrowLeft, Users, FileText, Search, Shield, History, Phone, Mail, Sparkles, ArrowRight, Zap } from "lucide-react"
import { MarketingNav } from "@/components/marketing/marketing-nav"
import { Footer } from "@/components/marketing/footer"

/* ============================================
   BACKUP DO CÓDIGO ANTERIOR (COMENTADO)
   ============================================
   
   [Código anterior comentado aqui para referência]
   
   ============================================
   FIM DO BACKUP
   ============================================ */

export default function CadastroPacientesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* MVP Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white text-center py-2 px-4 text-xs sm:text-sm font-medium">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 max-w-[100rem] mx-auto">
          <span className="inline-flex items-center gap-1.5">
            <span>Este produto se encontra em fase de testes</span>
            <span className="font-mono text-xs">{"</>"}</span>
          </span>
          <span className="hidden sm:inline opacity-75">|</span>
          <span className="opacity-90">Para mais informações consulte o desenvolvedor</span>
        </div>
      </div>
      <MarketingNav />
      
      <main className="relative w-full overflow-hidden bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl -z-10"></div>
        
        <div className="relative max-w-[100rem] mx-auto px-3 sm:px-3 lg:px-4 pt-12 lg:pt-20 pb-20">
          {/* Back Button */}
          <Link 
            href="/home#features" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-8 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar para funcionalidades</span>
          </Link>

          {/* Header */}
          <div className="mb-12 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200/50 rounded-full">
              <Users className="text-purple-600" size={18} />
              <span className="text-sm font-semibold text-gray-800">Funcionalidade</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900">
                Cadastro de{' '}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Pacientes
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-3xl">
                Armazene todos os dados dos seus pacientes em um único lugar seguro. Tenha acesso rápido ao histórico completo de atendimentos, tratamentos e informações importantes.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
            <div className="group relative bg-white rounded-3xl p-8 border border-gray-200 hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-3xl"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <FileText className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Dados Completos</h3>
                <p className="text-gray-600 leading-relaxed">
                  Cadastre informações pessoais, contatos, histórico médico, alergias e observações importantes de cada paciente.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-8 border border-gray-200 hover:border-pink-300 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-3xl"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Search className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Busca Rápida</h3>
                <p className="text-gray-600 leading-relaxed">
                  Encontre pacientes instantaneamente usando nome, CPF, telefone ou qualquer informação cadastrada.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-8 border border-gray-200 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-3xl"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <History className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Histórico Completo</h3>
                <p className="text-gray-600 leading-relaxed">
                  Acesse todo o histórico de atendimentos, tratamentos realizados e evolução de cada paciente.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-8 border border-gray-200 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-3xl"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Shield className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Segurança Total</h3>
                <p className="text-gray-600 leading-relaxed">
                  Seus dados estão protegidos com criptografia de nível bancário e conformidade com a LGPD.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits List */}
          <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-3xl p-8 lg:p-12 mb-16 border border-purple-200/50 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Sparkles className="text-white" size={24} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Principais Benefícios</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Cadastro rápido e intuitivo de novos pacientes",
                "Histórico completo de consultas e tratamentos",
                "Fotos e documentos anexados por paciente",
                "Controle de anamnese e informações médicas",
                "Busca avançada com múltiplos filtros",
                "Exportação de dados em diferentes formatos",
                "Integração com agenda e prontuários",
                "Backup automático de todas as informações",
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-white/50 rounded-xl">
                  <div className="p-1.5 bg-purple-100 rounded-full mt-0.5">
                    <Shield className="text-purple-600 flex-shrink-0" size={18} />
                  </div>
                  <p className="text-gray-700 font-medium">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 lg:p-12 text-white shadow-2xl">
            <div className="inline-flex p-4 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <Zap size={32} />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
              Experimente o Cadastro de Pacientes gratuitamente por 14 dias. Sem cartão de crédito.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cadastro"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:bg-purple-50"
              >
                <span>Criar conta grátis</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/home#features"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold transition-all duration-300 hover:bg-white/20 border border-white/20"
              >
                Ver outras funcionalidades
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

