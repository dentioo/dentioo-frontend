'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { HeroSection } from "@/components/marketing/hero-section"
import { BenefitsSection } from "@/components/marketing/benefits-section"
import { PricingSection } from "@/components/marketing/pricing-section"
import { TestimonialsSection } from "@/components/marketing/testimonials-section"
import { FAQSection } from "@/components/marketing/faq-section"
import { Footer } from "@/components/marketing/footer"
import { MarketingNav } from "@/components/marketing/marketing-nav"
import { ArrowUp } from "lucide-react"

export function HomePageClient() {
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Habilitar scroll suave
    if (typeof window !== 'undefined') {
      document.documentElement.style.scrollBehavior = 'smooth'
    }

    const token = localStorage.getItem('token')
    if (!token) return
    
    setIsVerifying(true)
    
    const verifySubscription = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const statusResponse = await fetch(`${apiUrl}/api/trial/status`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })

        if (!statusResponse.ok) {
          router.replace("/planos")
          return
        }

        const statusData = await statusResponse.json()
        const subscription = statusData.data?.subscription

        if (subscription?.status === "active") {
          router.replace("/dashboard/insights")
        } else {
          router.replace("/planos")
        }
      } catch (err) {
        router.replace("/planos")
      } finally {
        setIsVerifying(false)
      }
    }

    verifySubscription()
  }, [router])

  // Loading state melhorado
  if (typeof window !== 'undefined' && localStorage.getItem('token') && isVerifying) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/50 to-white backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-300">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <p className="text-gray-800 font-semibold text-lg mb-1">Verificando acesso...</p>
            <p className="text-gray-500 text-sm">Aguarde um momento</p>
          </div>
        </div>
      </div>
    )
  }

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
      
      <main className={`transition-opacity duration-700 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`transition-all duration-1000 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <HeroSection />
        </div>
        
        <div className={`transition-all duration-1000 delay-150 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <BenefitsSection />
        </div>
        
        <div className={`transition-all duration-1000 delay-300 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <PricingSection />
        </div>
        
        <div className={`transition-all duration-1000 delay-450 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <TestimonialsSection />
        </div>
        
        <div className={`transition-all duration-1000 delay-600 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <FAQSection />
        </div>
      </main>
      
      <Footer />

      {/* Botão para voltar ao topo */}
      <ScrollToTopButton />
    </div>
  )
}

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      title="Voltar ao topo"
      aria-label="Voltar ao topo"
    >
      <ArrowUp size={24} strokeWidth={2.5} />
    </button>
  )
}

