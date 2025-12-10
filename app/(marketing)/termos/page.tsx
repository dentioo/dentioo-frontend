'use client'

import Link from "next/link"
import { ArrowLeft, FileText, Shield, AlertCircle, Scale, XCircle, Gavel, Mail } from "lucide-react"
import { MarketingNav } from "@/components/marketing/marketing-nav"
import { Footer } from "@/components/marketing/footer"

const sections = [
  {
    icon: FileText,
    title: "1. Aceitação dos Termos",
    content: "Ao acessar e usar a Dentioo, você aceita estar vinculado a estes Termos de Uso. Se você não concordar com alguma parte destes termos, não use nosso serviço.",
  },
  {
    icon: Shield,
    title: "2. Licença de Uso",
    content: "Concedemos a você uma licença limitada, não exclusiva e revogável para usar a Dentioo para fins comerciais legítimos. Você concorda em não usar o serviço para fins ilegais ou prejudiciais.",
  },
  {
    icon: AlertCircle,
    title: "3. Responsabilidade do Usuário",
    content: "Você é responsável por manter a confidencialidade da sua senha, todas as atividades que ocorrem em sua conta, cumprir todas as leis aplicáveis e não violar direitos de terceiros.",
    list: [
      "Manter a confidencialidade da sua senha",
      "Todas as atividades que ocorrem em sua conta",
      "Cumprir todas as leis aplicáveis",
      "Não violar direitos de terceiros",
    ],
  },
  {
    icon: XCircle,
    title: "4. Limitações de Responsabilidade",
    content: "A Dentioo não é responsável por danos indiretos, incidentais, especiais ou consequentes resultantes do uso ou incapacidade de usar o serviço, mesmo que tenhamos sido informados da possibilidade de tais danos.",
  },
  {
    icon: Scale,
    title: "5. Modificações do Serviço",
    content: "Reservamos o direito de modificar ou descontinuar o serviço a qualquer momento, com ou sem aviso prévio. Não seremos responsáveis por qualquer modificação ou descontinuação do serviço.",
  },
  {
    icon: Gavel,
    title: "6. Rescisão",
    content: "Podemos encerrar sua conta e acesso ao serviço a qualquer momento, por qualquer motivo, inclusive violação destes Termos de Uso.",
  },
  {
    icon: Scale,
    title: "7. Lei Aplicável",
    content: "Estes Termos de Uso são regidos pelas leis do Brasil e você concorda em se submeter à jurisdição dos tribunais brasileiros.",
  },
  {
    icon: Mail,
    title: "8. Contato",
    content: "Para dúvidas sobre estes Termos de Uso, entre em contato conosco.",
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white">
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/50 rounded-full mb-6">
            <FileText className="text-blue-600" size={18} />
            <span className="text-sm font-semibold text-blue-700">Documento Legal</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-color-primary mb-4">
            Termos de Uso
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
                className="bg-white rounded-xl p-6 lg:p-8 border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="text-blue-600" size={24} />
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
                            <span className="text-blue-600 mt-1.5">•</span>
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
        <div className="mt-12 text-center bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
          <p className="text-gray-700 mb-4">
            Tem dúvidas sobre nossos termos?
          </p>
          <a
            href="mailto:pedro16hf@gmail.com"
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
