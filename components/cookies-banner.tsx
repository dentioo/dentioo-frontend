"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CookiesBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Verifica se o usuário já aceitou os cookies
    const cookiesAccepted = localStorage.getItem("dentioo_cookies_accepted")
    if (!cookiesAccepted) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("dentioo_cookies_accepted", "true")
    setIsVisible(false)
  }

  const handleReject = () => {
    localStorage.setItem("dentioo_cookies_accepted", "false")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Utilizamos Cookies</h3>
            <p className="text-sm text-gray-600">
              Usamos cookies para melhorar sua experiência e analisar o tráfego do site. Ao continuar navegando, você concorda com nossa{" "}
              <a href="/cookies" className="text-blue-600 hover:text-blue-700 underline">
                política de cookies
              </a>
              .
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center shrink-0">
            <Button
              onClick={handleReject}
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm cursor-pointer"
            >
              Rejeitar
            </Button>
            <Button
              onClick={handleAccept}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm cursor-pointer"
            >
              Aceitar
            </Button>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 sm:relative sm:top-0 sm:right-0 text-gray-400 hover:text-gray-600 cursor-pointer"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
