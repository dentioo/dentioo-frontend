'use client'

import Link from "next/link"
import { ArrowLeft, Cookie, Settings, BarChart3, Heart, Users, Mail } from "lucide-react"
import { MarketingNav } from "@/components/marketing/marketing-nav"
import { Footer } from "@/components/marketing/footer"

const cookieTypes = [
  {
    name: "Cookies Essenciais",
    description: "Necessários para o funcionamento básico do website",
    icon: Cookie,
    color: "blue",
  },
  {
    name: "Cookies de Análise",
    description: "Ajudam-nos a entender como você usa nosso site",
    icon: BarChart3,
    color: "green",
  },
  {
    name: "Cookies de Preferência",
    description: "Armazenam suas preferências e configurações",
    icon: Settings,
    color: "purple",
  },
  {
    name: "Cookies de Marketing",
    description: "Usados para fornecer anúncios relevantes",
    icon: Heart,
    color: "pink",
  },
]

const sections = [
  {
    icon: Cookie,
    title: "1. O que são Cookies?",
    content: "Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo quando você visita nosso website. Eles permitem que o site reconheça seu dispositivo e armazene informações sobre suas preferências.",
  },
  {
    icon: Settings,
    title: "3. Como Controlamos Cookies",
    content: "A maioria dos navegadores permite que você controle cookies através das suas configurações. Você pode optar por desativar cookies, mas isso pode afetar sua experiência no nosso website.",
  },
  {
    icon: Users,
    title: "4. Cookies de Terceiros",
    content: "Alguns cookies podem ser colocados por terceiros, como Google Analytics. Recomendamos que você leia as políticas de privacidade desses serviços.",
  },
  {
    icon: Cookie,
    title: "5. Consentimento",
    content: "Ao continuar usando nosso website após a notificação sobre cookies, você consente com o uso de cookies de acordo com esta política.",
  },
]

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/20 to-white">
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100/50 rounded-full mb-6">
            <Cookie className="text-orange-600" size={18} />
            <span className="text-sm font-semibold text-orange-700">Documento Legal</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-color-primary mb-4">
            Política de Cookies
          </h1>
          <p className="text-gray-600 text-sm">
            Última atualização: {new Date().toLocaleDateString("pt-BR", { 
              day: "numeric", 
              month: "long", 
              year: "numeric" 
            })}
          </p>
        </div>

        {/* Cookie Types Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Tipos de Cookies Utilizados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cookieTypes.map((cookie, index) => {
              const Icon = cookie.icon
              const colorClasses = {
                blue: "bg-blue-50 border-blue-200 text-blue-600",
                green: "bg-green-50 border-green-200 text-green-600",
                purple: "bg-purple-50 border-purple-200 text-purple-600",
                pink: "bg-pink-50 border-pink-200 text-pink-600",
              }
              return (
                <div
                  key={index}
                  className={`rounded-xl p-6 border-2 ${colorClasses[cookie.color as keyof typeof colorClasses]} hover:shadow-md transition-all duration-300`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Icon size={28} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">{cookie.name}</h3>
                      <p className="text-sm opacity-90">{cookie.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 lg:p-8 border border-gray-200 hover:border-orange-200 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Icon className="text-orange-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
                      {section.title}
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-100">
          <p className="text-gray-700 mb-4">
            Tem dúvidas sobre cookies?
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
