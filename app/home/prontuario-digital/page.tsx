'use client'

import Link from "next/link"
import { ArrowLeft, FileText, Lock, Edit, Download, Share2, Image, FileCheck, Sparkles, ArrowRight, Zap } from "lucide-react"
import { MarketingNav } from "@/components/marketing/marketing-nav"
import { Footer } from "@/components/marketing/footer"

/* ============================================
   BACKUP DO CÓDIGO ANTERIOR (COMENTADO)
   ============================================
   
   [Código anterior comentado aqui para referência]
   
   ============================================
   FIM DO BACKUP
   ============================================ */

export default function ProntuarioDigitalPage() {
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
      
      <main className="relative w-full overflow-hidden bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl -z-10"></div>
        
        <div className="relative max-w-[100rem] mx-auto px-3 sm:px-3 lg:px-4 pt-12 lg:pt-20 pb-20">
          {/* Back Button */}
          <Link 
            href="/home#features" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors mb-8 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar para funcionalidades</span>
          </Link>

          {/* Header */}
          <div className="mb-12 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200/50 rounded-full">
              <FileText className="text-green-600" size={18} />
              <span className="text-sm font-semibold text-gray-800">Funcionalidade</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900">
                Prontuário{' '}
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Digital
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-3xl">
                Prontuários eletrônicos seguros e completos. Registre anotações, diagnósticos, planos de tratamento e muito mais de forma organizada e acessível.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
            <div className="group relative bg-white rounded-3xl p-8 border border-gray-200 hover:border-green-300 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-3xl"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Edit className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Anotações Completas</h3>
                <p className="text-gray-600 leading-relaxed">
                  Registre anamnese, exame físico, diagnóstico, plano de tratamento e evolução de cada atendimento de forma detalhada.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-8 border border-gray-200 hover:border-emerald-300 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-3xl"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Image className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Anexos e Imagens</h3>
                <p className="text-gray-600 leading-relaxed">
                  Anexe radiografias, fotos, documentos e exames diretamente no prontuário do paciente.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-8 border border-gray-200 hover:border-teal-300 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-3xl"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Lock className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Segurança Máxima</h3>
                <p className="text-gray-600 leading-relaxed">
                  Prontuários protegidos com criptografia avançada, acesso controlado e auditoria completa de alterações.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-8 border border-gray-200 hover:border-cyan-300 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-3xl"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Download className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Exportação Fácil</h3>
                <p className="text-gray-600 leading-relaxed">
                  Exporte prontuários em PDF, imprima ou compartilhe com outros profissionais quando necessário.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits List */}
          <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl p-8 lg:p-12 mb-16 border border-green-200/50 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <Sparkles className="text-white" size={24} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Principais Benefícios</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Prontuários eletrônicos completos e organizados",
                "Templates personalizáveis para diferentes procedimentos",
                "Histórico completo de todos os atendimentos",
                "Anexos ilimitados de imagens e documentos",
                "Assinatura digital para validar documentos",
                "Busca rápida por palavras-chave ou datas",
                "Conformidade com regulamentações do CFO",
                "Backup automático e seguro na nuvem",
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-white/50 rounded-xl">
                  <div className="p-1.5 bg-green-100 rounded-full mt-0.5">
                    <FileCheck className="text-green-600 flex-shrink-0" size={18} />
                  </div>
                  <p className="text-gray-700 font-medium">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 lg:p-12 text-white shadow-2xl">
            <div className="inline-flex p-4 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <Zap size={32} />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
              Experimente o Prontuário Digital gratuitamente por 14 dias. Sem cartão de crédito.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cadastro"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-green-600 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:bg-green-50"
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

