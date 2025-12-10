"use client"

import { MessageCircle, Sparkles, Heart } from "lucide-react"

/* ============================================
   BACKUP DO CÓDIGO ANTERIOR (COMENTADO)
   ============================================
   
   [Código anterior comentado aqui para referência]
   
   ============================================
   FIM DO BACKUP
   ============================================ */

const testimonials = [
  {
    name: "Dr. Fulano",
    username: "@drfulano",
    comment: "Sua mensagem estará aqui!",
    avatar: "👨‍💻",
  },
  {
    name: "Dr. Ciclano",
    username: "@drciclano",
    comment: "Sua mensagem estará aqui!",
    avatar: "👩‍💻",
  },
  {
    name: "Dr. Beltrano",
    username: "@drbeltrano",
    comment: "Sua mensagem estará aqui!",
    avatar: "👨‍💼",
  },
  {
    name: "Dra. Maria",
    username: "@dramaria",
    comment: "Sua mensagem estará aqui!",
    avatar: "👨‍💻",
  },
  {
    name: "Dr. João",
    username: "@drjoao",
    comment: "Sua mensagem estará aqui!",
    avatar: "👩‍⚕️",
  },
]

export function TestimonialsSection() {
  return (
    <section className="relative bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl -z-10"></div>
      
      <div className="relative max-w-[100rem] mx-auto px-3 sm:px-3 lg:px-4 z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200/50">
            <Heart size={16} className="text-red-500" />
            <span className="text-sm font-semibold text-gray-800">Depoimentos</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
            O que nossos{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              clientes dizem
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Confira os depoimentos de dentistas que já transformaram suas clínicas com o Dentioo
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl shadow-sm">
            <Sparkles size={16} className="text-blue-600" />
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Produto em MVP</span> - Deseja ter seu comentário adicionado?{" "}
              <a 
                href="https://wa.me/5534998731732?text=Olá! Gostaria de adicionar meu comentário/depoimento sobre o Dentioo." 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-semibold text-blue-600 hover:text-blue-700 underline transition-colors"
              >
                Entre em contato agora!
              </a>
            </p>
          </div>
        </div>

        {/* Marquee Container */}
        <div className="flex-auto w-full overflow-hidden rounded-lg py-8 relative">
          {/* First Marquee - Left to Right */}
          <div className="group/marquee">
            <div className="relative flex overflow-x-hidden py-3">
              <div className="flex gap-6 whitespace-nowrap" style={{ animation: 'marquee 30s linear infinite', willChange: 'transform' }}>
                {[...testimonials, ...testimonials].map((testimonial, index) => (
                  <div key={index} className="shrink-0">
                    <div className="hover:shadow-[0px_0px_12px_0px_rgba(0,0,0,0.2)] transition-all duration-300 flex-1 block bg-white border border-gray-200/50 w-[80vw] md:w-[560px] pl-6 pr-8 pt-6 pb-10 rounded-lg min-h-[200px]">
                      <div className="flex flex-col h-full">
                        {/* Header with avatar and WhatsApp icon */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-blue-50 flex items-center justify-center text-2xl">
                              {testimonial.avatar}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-900 font-semibold text-lg leading-tight tracking-tight">
                                {testimonial.name}
                              </span>
                              <span className="text-gray-600 font-medium text-base leading-tight tracking-tight">
                                {testimonial.username}
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor"></path>
                            </svg>
                          </div>
                        </div>
                        {/* Message */}
                        <p className="text-left text-gray-600 font-medium text-lg leading-[180%] tracking-wide flex-1 wrap-break-word whitespace-normal mt-4">
                          {testimonial.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Second Marquee - Right to Left (Reverse) */}
          <div className="group/marquee">
            <div className="relative flex overflow-x-hidden py-3">
              <div className="flex gap-6 whitespace-nowrap" style={{ animation: 'marquee 30s linear infinite reverse', willChange: 'transform' }}>
                {[...testimonials, ...testimonials].map((testimonial, index) => (
                  <div key={`reverse-${index}`} className="shrink-0">
                    <div className="hover:shadow-[0px_0px_12px_0px_rgba(0,0,0,0.2)] transition-all duration-300 flex-1 block bg-white border border-gray-200/50 w-[80vw] md:w-[560px] pl-6 pr-8 pt-6 pb-10 rounded-lg min-h-[200px]">
                      <div className="flex flex-col h-full">
                        {/* Header with avatar and WhatsApp icon */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-blue-50 flex items-center justify-center text-2xl">
                              {testimonial.avatar}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-900 font-semibold text-lg leading-tight tracking-tight">
                                {testimonial.name}
                              </span>
                              <span className="text-gray-600 font-medium text-base leading-tight tracking-tight">
                                {testimonial.username}
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor"></path>
                            </svg>
                          </div>
                        </div>
                        {/* Message */}
                        <p className="text-left text-gray-600 font-medium text-lg leading-[180%] tracking-wide flex-1 wrap-break-word whitespace-normal mt-4">
                          {testimonial.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
