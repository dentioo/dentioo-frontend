'use client'

import Link from "next/link"
import { ArrowLeft, Shield, Database, Eye, Lock, CheckCircle2, Mail } from "lucide-react"
import { MarketingNav } from "@/components/marketing/marketing-nav"
import { Footer } from "@/components/marketing/footer"

const sections = [
  {
    icon: Shield,
    title: "1. Introdução",
    content: "A Dentioo ('nós', 'nos' ou 'nossa') opera o site Dentioo. Esta página informa você sobre nossas políticas de coleta, uso e divulgação de dados pessoais quando você usa nosso serviço.",
  },
  {
    icon: Database,
    title: "2. Coleta de Dados",
    content: "Coletamos dados de diferentes formas para melhorar nossos serviços:",
    list: [
      "Informações que você nos fornece diretamente (email, nome, dados de clínica)",
      "Dados coletados automaticamente quando você acessa nosso site (cookies, endereço IP)",
      "Informações sobre sua utilização do serviço",
    ],
  },
  {
    icon: Eye,
    title: "3. Uso de Dados",
    content: "Usamos seus dados para:",
    list: [
      "Fornecer e manter nossos serviços",
      "Melhorar e personalizar sua experiência",
      "Comunicar com você sobre atualizações e suporte",
      "Cumprir obrigações legais",
    ],
  },
  {
    icon: Lock,
    title: "4. Segurança dos Dados",
    content: "A segurança dos seus dados é importante para nós. Implementamos medidas de segurança técnicas, administrativas e físicas para proteger seus dados pessoais contra acesso não autorizado e alteração.",
  },
  {
    icon: CheckCircle2,
    title: "5. Seus Direitos",
    content: "Você tem o direito de:",
    list: [
      "Acessar seus dados pessoais",
      "Corrigir dados imprecisos",
      "Solicitar a exclusão de seus dados",
      "Opor-se ao processamento de seus dados",
    ],
  },
  {
    icon: Mail,
    title: "6. Contato",
    content: "Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco em suporte@dentioo.com.",
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/20 to-white">
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
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Back Button */}
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-color-primary transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="transform group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Voltar</span>
        </Link>

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100/50 rounded-full mb-6">
            <Shield className="text-purple-600" size={18} />
            <span className="text-sm font-semibold text-purple-700">Documento Legal</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-color-primary mb-4">
            Política de Privacidade
          </h1>
          <p className="text-gray-600 text-sm">
            Última atualização: {new Date().toLocaleDateString("pt-BR", { 
              day: "numeric", 
              month: "long", 
              year: "numeric" 
            })}
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 lg:p-8 border border-gray-200 hover:border-purple-200 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Icon className="text-purple-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
                      {section.title}
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {section.content}
                    </p>
                    {section.list && (
                      <ul className="space-y-2 mt-4">
                        {section.list.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-purple-600 mt-1.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
          <p className="text-gray-700 mb-4">
            Tem dúvidas sobre privacidade?
          </p>
          <a
            href="mailto:suporte@dentioo.com"
            className="inline-flex items-center gap-2 text-color-primary hover:text-color-primary-dark font-semibold transition-colors"
          >
            <Mail size={18} />
            Entre em contato
          </a>
        </div>
      </main>

      <Footer />
    </div>
  )
}
