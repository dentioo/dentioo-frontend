import type React from "react"
import { MarketingNav } from "@/components/marketing/marketing-nav"
import { Footer } from "@/components/marketing/footer"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Lado esquerdo - Imagem */}
        <div className="hidden lg:flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url(https://i.ibb.co/VWFB6wrK/Sem-t-tulo.jpg)' }}>
        </div>
        
        {/* Lado direito - Form */}
        <div className="bg-white flex items-center justify-center p-4 lg:p-0 w-full">
          <div className="flex items-center justify-center w-full">
            {children}
          </div>
        </div>
      </div>
      <div className="w-full">
        <Footer />
      </div>
    </>
  )
}
