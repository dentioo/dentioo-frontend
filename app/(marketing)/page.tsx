'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HeroSection } from "@/components/marketing/hero-section"
import { BenefitsSection } from "@/components/marketing/benefits-section"
import { PricingSection } from "@/components/marketing/pricing-section"
import { FAQSection } from "@/components/marketing/faq-section"
import { Footer } from "@/components/marketing/footer"
import { MarketingNav } from "@/components/marketing/marketing-nav"

export default function LandingPage() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Habilitar scroll suave
    if (typeof window !== 'undefined') {
      document.documentElement.style.scrollBehavior = 'smooth'
    }

    const token = localStorage.getItem('token')
    if (token) {
      router.replace('/dashboard/insights')
    }
  }, [router])

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
          <FAQSection />
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
