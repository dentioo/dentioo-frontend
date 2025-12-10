"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle, Sparkles, MessageCircle } from "lucide-react"
import "@/styles/faq-animation.css"

/* ============================================
   BACKUP DO CÓDIGO ANTERIOR (COMENTADO)
   ============================================
   
   [Código anterior comentado aqui para referência]
   
   ============================================
   FIM DO BACKUP
   ============================================ */

const faqs = [
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer:
      "Sim, você pode cancelar sua assinatura a qualquer momento sem penalidades. Seus dados estarão disponíveis para download até 30 dias após o cancelamento.",
  },
  {
    question: "Como funciona o período de teste gratuito?",
    answer:
      "Você tem 14 dias para testar todas as funcionalidades do Dentioo completamente grátis. Não é necessário adicionar cartão de crédito para começar.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Sim, utilizamos criptografia de nível bancário para proteger todos os seus dados. Realizamos backups automáticos diários e cumprimos com as regulamentações LGPD.",
  },
  {
    question: "Posso migrar de outro sistema?",
    answer:
      "Sim, nossa equipe oferece suporte completo para migração de dados de outros sistemas. Entraremos em contato para entender suas necessidades.",
  },
  {
    question: "Como funciona o suporte ao cliente?",
    answer:
      "Oferecemos suporte via email para todos os planos e suporte 24/7 via chat para o plano Premium. Também temos uma base de conhecimento completa e tutoriais em vídeo.",
  },
  {
    question: "É possível adicionar mais usuários à minha conta?",
    answer:
      "Sim, você pode adicionar usuários conforme necessário. O número de usuários permitidos depende do plano escolhido.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="relative w-full overflow-hidden bg-gradient-to-b from-white via-gray-50/30 to-white py-20 lg:py-32">
      {/* Decorative elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl -z-10"></div>
      
      <div className="relative max-w-[100rem] mx-auto px-3 sm:px-3 lg:px-4">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200/50">
            <HelpCircle size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-800">FAQ</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Perguntas{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Frequentes
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre o Dentioo
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left side - Image */}
          <div className="hidden lg:flex justify-center items-start">
            <img 
              src="https://i.ibb.co/S7mR3nDq/undraw-questions-g2px.png" 
              alt="Questions illustration" 
              className="w-full max-w-md h-auto"
            />
          </div>

          {/* Right side - FAQ Content */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`group bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                  openIndex === index 
                    ? "border-blue-300 shadow-lg" 
                    : "border-gray-200 hover:border-gray-300 shadow-sm"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start gap-4 flex-1 text-left">
                    <div className={`p-2 rounded-lg transition-colors ${
                      openIndex === index 
                        ? "bg-blue-100" 
                        : "bg-gray-100 group-hover:bg-blue-50"
                    }`}>
                      <HelpCircle 
                        size={20} 
                        className={`transition-colors ${
                          openIndex === index 
                            ? "text-blue-600" 
                            : "text-gray-400"
                        }`} 
                      />
                    </div>
                    <h3 className={`font-semibold text-lg transition-colors ${
                      openIndex === index 
                        ? "text-blue-900" 
                        : "text-gray-900"
                    }`}>
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 shrink-0 transition-all duration-300 ${
                      openIndex === index 
                        ? "rotate-180 text-blue-600" 
                        : "group-hover:text-gray-600"
                    }`}
                  />
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}>
                  <div className="px-6 pb-5 pt-2 bg-gradient-to-b from-gray-50/50 to-white border-t border-gray-100">
                    <div className="pl-12">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white text-center shadow-2xl">
          <div className="inline-flex p-4 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
            <MessageCircle size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-2">Ainda tem dúvidas?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Nossa equipe está pronta para ajudar. Entre em contato e tire todas as suas dúvidas.
          </p>
          <a 
            href="https://wa.me/5534998731732" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            <MessageCircle size={20} />
            Falar com Suporte
          </a>
        </div>
      </div>
    </section>
  )
}
