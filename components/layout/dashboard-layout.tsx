"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const SIDEBAR_STORAGE_KEY = "dentioo_sidebar_open"

export function DashboardLayout({ children }: DashboardLayoutProps) {
  // Carregar estado inicial do localStorage (padrão: true/aberta)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY)
      return saved !== null ? saved === "true" : true // Padrão: aberta
    }
    return true
  })

  // Salvar no localStorage sempre que o estado mudar
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarOpen))
    }
  }, [sidebarOpen])

  return (
    <div className="flex flex-col h-screen bg-color-bg-light overflow-hidden">
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
      {/* Navbar - Fixed at top */}
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      
      {/* Content area with Sidebar + Main */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main content - Scrollable only */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>
    </div>
  )
}
