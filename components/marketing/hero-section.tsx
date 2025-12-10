"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Users, Sparkles, Zap, TrendingUp, Shield, CheckCircle2 } from "lucide-react"
import { DashboardPreview } from "./dashboard-preview"

/* ============================================
   BACKUP DO CÓDIGO ANTERIOR (COMENTADO)
   ============================================
   
   [Código anterior comentado aqui para referência]
   
   ============================================
   FIM DO BACKUP
   ============================================ */

export function HeroSection() {
  const stats = [
    { label: "Clínicas Ativas", value: "10+", icon: Users },
    { label: "Pacientes Gerenciados", value: "150+", icon: TrendingUp },
    { label: "Satisfação", value: "99%", icon: CheckCircle2 },
  ]

  // Array com as 2 imagens e suas posições específicas (desktop e mobile)
  const backgroundImages = [
    {
      url: 'https://i.ibb.co/0p4W1Z6W/close-no-medico-se-preparando-para-o-trabalho.png',
      position: 'left -125px center', // Movida 25px mais para a esquerda
      mobilePosition: 'right -525px center' // Mobile ajustado
    },
    {
      url: 'https://i.ibb.co/STTHJnS/uma-dentista-linda-a-trabalhar-numa-clinica-dentaria.png',
      position: 'left -285px center', // Movida mais 20px para a esquerda
      mobilePosition: 'right -685px center' // Mobile ajustado
    }
  ]

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [displayImageIndex, setDisplayImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Trocar imagem automaticamente a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentImageIndex + 1) % backgroundImages.length
      setIsTransitioning(true)
      
      // Fade out da imagem atual
      setTimeout(() => {
        setDisplayImageIndex(nextIndex)
        setCurrentImageIndex(nextIndex)
        
        // Fade in da nova imagem
        setTimeout(() => {
          setIsTransitioning(false)
        }, 50)
      }, 1000) // 1 segundo de fade out
    }, 5000) // Trocar a cada 5 segundos

    return () => clearInterval(interval)
  }, [currentImageIndex, backgroundImages.length])
  
  // Inicializar displayImageIndex
  useEffect(() => {
    setDisplayImageIndex(currentImageIndex)
  }, [])

  // Ajustar posição das imagens baseado no tamanho da tela
  useEffect(() => {
    const updateBackgroundPositions = () => {
      const windowWidth = window.innerWidth
      const baseOffset1 = -125
      const baseOffset2 = -285
      
      // Calcular ajuste baseado na largura da tela (ajustar mais para a esquerda em telas menores)
      // Quanto menor a tela, mais para a esquerda as imagens devem ir
      let adjustment1 = 0
      let adjustment2 = 0
      
      // Telas muito grandes (>= 1920px) - posição base
      if (windowWidth >= 1920) {
        adjustment1 = 0
        adjustment2 = 0
      } 
      // Telas médias (1280px - 1919px)
      else if (windowWidth >= 1280) {
        const scale = (1920 - windowWidth) / (1920 - 1280)
        adjustment1 = -60 * scale // Ajuste progressivo até -60px
        adjustment2 = -100 * scale // Ajuste progressivo até -100px
      }
      // Telas menores (< 1280px)
      else {
        const scale = windowWidth / 1280
        adjustment1 = -60 + (-40 * (1 - scale)) // De -60px até -100px
        adjustment2 = -100 + (-80 * (1 - scale)) // De -100px até -180px
      }
      
      // Atualizar todas as imagens (incluindo a que está sendo exibida)
      for (let i = 0; i < backgroundImages.length; i++) {
        const img = document.getElementById(`hero-bg-${i}`)
        if (img) {
          if (i === 0) {
            const newPosition1 = baseOffset1 + adjustment1
            img.style.backgroundPosition = `left ${newPosition1}px center`
          } else if (i === 1) {
            const newPosition2 = baseOffset2 + adjustment2
            img.style.backgroundPosition = `left ${newPosition2}px center`
          }
        }
      }
    }
    
    // Executar quando a imagem mudar ou quando a tela redimensionar
    updateBackgroundPositions()
    
    // Usar debounce para melhor performance
    let resizeTimer: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(updateBackgroundPositions, 50)
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimer)
    }
  }, [displayImageIndex])

  return (
    <section 
      className="relative w-full overflow-visible bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 hero-bg-mobile"
    >
      {/* Background Images com transição - Imagem atual */}
      <div 
        className={`hidden lg:block absolute inset-0 transition-opacity duration-1000 ease-in-out hero-bg-slider-${displayImageIndex}`}
        style={{
          backgroundImage: `url(${backgroundImages[displayImageIndex].url})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          opacity: isTransitioning ? 0 : 1,
          zIndex: 1,
          transition: 'opacity 1s ease-in-out, background-position 0.3s ease-out',
        }}
        id={`hero-bg-${displayImageIndex}`}
      />
      {/* Overlay para melhorar legibilidade do texto */}
      <div className="absolute inset-0 bg-white/60 lg:bg-gradient-to-r from-white/60 via-white/40 to-transparent -z-0"></div>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl -z-10"></div>
      
      <div className="relative max-w-[100rem] mx-auto px-3 sm:px-3 lg:px-4 pt-12 lg:pt-[75px] pb-16 lg:pb-32 z-10">
        <div className="max-w-4xl">
          {/* Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700 relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200/50 rounded-full shadow-sm">
              <div className="flex items-center">
                <Users size={16} className="text-blue-600 -mr-2" />
                <Users size={16} className="text-purple-600 -mr-1" />
                <Sparkles size={14} className="text-blue-600 ml-1" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Transforme sua gestão odontológica</span>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
                Gerencie sua clínica com{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    inteligência
                  </span>
                  {/* Shimmer white effect */}
                  <span className="absolute inset-0 z-20 animate-shimmer-white pointer-events-none">
                    inteligência
                  </span>
                  <span className="absolute bottom-2 left-0 right-0 h-3 bg-blue-100/50 -z-0 rounded-lg"></span>
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                <span className="font-semibold text-gray-900">Tudo em um só lugar:</span> agenda inteligente, prontuários digitais, orçamentos e gestão financeira completa.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/cadastro" 
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Começar Agora
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={() => {
                  const pricingSection = document.getElementById('pricing');
                  pricingSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Ver Planos
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg mb-2">
                      <Icon size={20} className="text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Indicadores de Imagem - Acima do Dashboard Preview */}
        <div className="mt-20 lg:mt-32 mb-6 flex justify-center items-center gap-3 relative z-10">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (index !== currentImageIndex) {
                  setIsTransitioning(true)
                  setTimeout(() => {
                    setDisplayImageIndex(index)
                    setCurrentImageIndex(index)
                    setTimeout(() => {
                      setIsTransitioning(false)
                    }, 50)
                  }, 1000)
                }
              }}
              className={`transition-all duration-300 ${
                currentImageIndex === index
                  ? 'w-3 h-3 bg-blue-600 rounded-full shadow-md'
                  : 'w-2.5 h-2.5 bg-gray-300 rounded-full hover:bg-gray-400 hover:w-3 hover:h-3'
              }`}
              aria-label={`Ir para imagem ${index + 1}`}
              title={`Imagem ${index + 1}`}
            />
          ))}
        </div>

        {/* Dashboard Preview */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="ml-4 text-sm text-gray-600 font-medium">Dashboard Preview</div>
            </div>
            <div className="p-6 lg:p-8 min-h-[700px] max-h-[800px] overflow-y-auto">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
