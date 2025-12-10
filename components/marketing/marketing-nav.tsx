"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Menu, X, Sparkles, ArrowRight, Zap, ChevronDown, Search } from "lucide-react"

/* ============================================
   BACKUP DO CÓDIGO ANTERIOR (COMENTADO)
   ============================================
   
   export function MarketingNav() {
     const [isOpen, setIsOpen] = useState(false)
     const [isVisible, setIsVisible] = useState(true)
     const [lastScrollY, setLastScrollY] = useState(0)

     useEffect(() => {
       const handleScroll = () => {
         const currentScrollY = window.scrollY
         
         if (currentScrollY > lastScrollY && currentScrollY > 100) {
           setIsVisible(false)
         } else {
           setIsVisible(true)
         }
         
         setLastScrollY(currentScrollY)
       }

       window.addEventListener("scroll", handleScroll)
       return () => window.removeEventListener("scroll", handleScroll)
     }, [lastScrollY])

     return (
       <nav className={`sticky top-0 z-50 bg-white border-b border-color-neutral-light transition-transform duration-300 ${
         isVisible ? "translate-y-0" : "-translate-y-full"
       }`}>
         <div className="w-full px-3 sm:px-3 md:px-3 lg:px-4 py-4">
           <div className="max-w-[100rem] mx-auto flex items-center justify-between">
           <Link href="/" className="flex items-center text-xl font-bold text-color-primary-dark">
             <img
               src="https://i.ibb.co/spbyHVwM/d85c195c-8521-40c3-862d-26101de8d716-Copia.png"
               alt="Logo Dentioo"
               className="h-8 w-8 mr-2 rounded-full object-cover"
             />
             Dentioo
           </Link>

           <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
             {isOpen ? <X size={24} /> : <Menu size={24} />}
           </button>

           <div
             className={`${
               isOpen ? "block" : "hidden"
             } md:flex absolute md:static top-full left-0 right-0 bg-white md:bg-transparent flex-col md:flex-row p-4 md:p-0 gap-2 md:gap-4 md:items-center`}
           >
             <a href="/home#features" className="text-gray-600 hover:text-color-primary-dark hover:bg-gray-100 px-2 py-1 rounded-lg transition-all duration-200 text-base">
               Funcionalidades
             </a>
             <a href="/home#pricing" className="text-gray-600 hover:text-color-primary-dark hover:bg-gray-100 px-2 py-1 rounded-lg transition-all duration-200 text-base">
               Preços
             </a>
             <a href="/home#faq" className="text-gray-600 hover:text-color-primary-dark hover:bg-gray-100 px-2 py-1 rounded-lg transition-all duration-200 text-base">
               FAQ
             </a>
             <div className="hidden md:block h-6 w-px bg-gray-200"></div>
             <div className="flex gap-2 md:gap-4 flex-col md:flex-row md:items-center">
               <Link href="/login" className="text-gray-600 hover:text-color-primary-dark hover:bg-gray-100 px-2 py-1 rounded-lg transition-all duration-200 text-base font-medium">
                 Entrar
               </Link>
               <Link
                 href="/cadastro"
                 className="bg-color-primary-light hover:bg-[#0d2847] text-white px-4 py-2 rounded-lg text-base font-medium transition-colors duration-300"
               >
                 Cadastre-se
               </Link>
             </div>
           </div>
           </div>
         </div>
       </nav>
     )
   }
   
   ============================================
   FIM DO BACKUP
   ============================================ */

// Dados pesquisáveis da página /home
const searchableContent = [
  { title: "Funcionalidades", href: "/home#features", keywords: ["funcionalidade", "funcionalidades", "features", "recursos", "ferramentas", "agenda", "pacientes", "prontuário"] },
  { title: "Agenda Inteligente", href: "/home/agenda-inteligente", keywords: ["agenda", "agendamento", "consultas", "calendário", "horários", "marcar"] },
  { title: "Cadastro de Pacientes", href: "/home/cadastro-pacientes", keywords: ["cadastro", "pacientes", "clientes", "dados", "histórico", "informações"] },
  { title: "Prontuário Digital", href: "/home/prontuario-digital", keywords: ["prontuário", "prontuarios", "digital", "eletrônico", "anotações", "diagnóstico", "tratamento"] },
  { title: "Preços", href: "/home#pricing", keywords: ["preço", "preços", "pricing", "planos", "valor", "custo", "starter", "professional", "premium"] },
  { title: "FAQ", href: "/home#faq", keywords: ["faq", "perguntas", "dúvidas", "ajuda", "suporte", "respostas", "frequentes"] },
  { title: "Gestão Financeira", href: "/home#features", keywords: ["financeiro", "financeira", "orçamentos", "pagamentos", "receitas", "despesas"] },
  { title: "Depoimentos", href: "/home#testimonials", keywords: ["depoimentos", "testemunhos", "avaliações", "opiniões", "clientes"] },
]

export function MarketingNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isInicioDropdownOpen, setIsInicioDropdownOpen] = useState(false)
  const [isServicosDropdownOpen, setIsServicosDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  // Filtrar resultados de busca
  const filteredResults = searchQuery.trim()
    ? searchableContent.filter(item =>
        item.keywords.some(keyword =>
          keyword.toLowerCase().includes(searchQuery.toLowerCase())
        ) || item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.inicio-dropdown')) {
        setIsInicioDropdownOpen(false)
      }
      if (!target.closest('.servicos-dropdown')) {
        setIsServicosDropdownOpen(false)
      }
      if (!target.closest('.search-container')) {
        setShowSearchResults(false)
      }
    }

    if (isInicioDropdownOpen || isServicosDropdownOpen || showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isInicioDropdownOpen, isServicosDropdownOpen, showSearchResults])

  // Função de pesquisa
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim() && filteredResults.length > 0) {
      window.location.href = filteredResults[0].href
      setSearchQuery("")
      setShowSearchResults(false)
    }
  }

  // Navegar para resultado selecionado
  const handleResultClick = (href: string) => {
    window.location.href = href
    setSearchQuery("")
    setShowSearchResults(false)
    setIsOpen(false)
  }

  return (
    <>
      {/* Overlay for mobile menu */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <nav className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-all duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}>
        <div className="w-full px-3 sm:px-3 md:px-3 lg:px-4 py-4">
          <div className="max-w-[100rem] mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3"
          >
            <img
              src="https://i.ibb.co/spbyHVwM/d85c195c-8521-40c3-862d-26101de8d716-Copia.png"
              alt="Logo Dentioo"
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dentioo
            </span>
          </Link>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors z-50 relative"
            >
              {isOpen ? (
                <X size={24} className="text-gray-700" />
              ) : (
                <Menu size={24} className="text-gray-700" />
              )}
            </button>

            {/* Navigation Links */}
            <div
              className={`md:flex fixed md:static top-0 right-0 h-screen md:h-auto w-80 md:w-auto bg-white md:bg-transparent flex-col md:flex-row p-6 md:p-0 gap-6 md:gap-2 md:items-center shadow-xl md:shadow-none border-l md:border-l-0 border-gray-100 md:border-0 transition-transform duration-300 ease-in-out z-50 ${
                isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
              }`}
            >
            {/* Início Dropdown */}
            <div className="relative inicio-dropdown w-full md:w-auto mb-4 md:mb-0">
              <button
                onClick={() => setIsInicioDropdownOpen(!isInicioDropdownOpen)}
                className="flex items-center justify-between md:justify-start gap-1.5 px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 text-base font-medium w-full md:w-auto"
              >
                Início
                <ChevronDown 
                  size={16} 
                  className={`transition-transform duration-200 ${isInicioDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              
              {/* Dropdown Menu - Desktop */}
              {isInicioDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 hidden md:block">
                  <a 
                    href="/home#features" 
                    onClick={() => {
                      setIsInicioDropdownOpen(false)
                      setIsOpen(false)
                    }}
                    className="block px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm font-medium"
                  >
                    Funcionalidades
                  </a>
                  <a 
                    href="/home#pricing" 
                    onClick={() => {
                      setIsInicioDropdownOpen(false)
                      setIsOpen(false)
                    }}
                    className="block px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm font-medium"
                  >
                    Preços
                  </a>
                  <a 
                    href="/home#faq" 
                    onClick={() => {
                      setIsInicioDropdownOpen(false)
                      setIsOpen(false)
                    }}
                    className="block px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm font-medium"
                  >
                    FAQ
                  </a>
                </div>
              )}
              
              {/* Dropdown Menu - Mobile */}
              {isInicioDropdownOpen && (
                <div className="md:hidden mt-2 space-y-1 pl-4 border-l-2 border-blue-100">
                  <a 
                    href="/home#features" 
                    onClick={() => {
                      setIsInicioDropdownOpen(false)
                      setIsOpen(false)
                    }}
                    className="block px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 text-sm font-medium"
                  >
                    Funcionalidades
                  </a>
                  <a 
                    href="/home#pricing" 
                    onClick={() => {
                      setIsInicioDropdownOpen(false)
                      setIsOpen(false)
                    }}
                    className="block px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 text-sm font-medium"
                  >
                    Preços
                  </a>
                  <a 
                    href="/home#faq" 
                    onClick={() => {
                      setIsInicioDropdownOpen(false)
                      setIsOpen(false)
                    }}
                    className="block px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 text-sm font-medium"
                  >
                    FAQ
                  </a>
                </div>
              )}
            </div>
            
            {/* Serviços Dropdown */}
            <div className="relative servicos-dropdown w-full md:w-auto mb-4 md:mb-0">
              <button
                onClick={() => setIsServicosDropdownOpen(!isServicosDropdownOpen)}
                className="flex items-center justify-between md:justify-start gap-1.5 px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 text-base font-medium w-full md:w-auto"
              >
                Serviços
                <ChevronDown 
                  size={16} 
                  className={`transition-transform duration-200 ${isServicosDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              
              {/* Dropdown Menu - Desktop */}
              {isServicosDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 hidden md:block">
                  <a 
                    href="/home/agenda-inteligente" 
                    onClick={() => {
                      setIsServicosDropdownOpen(false)
                      setIsOpen(false)
                    }}
                    className="block px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm font-medium"
                  >
                    Agenda Inteligente
                  </a>
                  <a 
                    href="/home/cadastro-pacientes" 
                    onClick={() => {
                      setIsServicosDropdownOpen(false)
                      setIsOpen(false)
                    }}
                    className="block px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm font-medium"
                  >
                    Cadastro de Pacientes
                  </a>
                  <a 
                    href="/home/prontuario-digital" 
                    onClick={() => {
                      setIsServicosDropdownOpen(false)
                      setIsOpen(false)
                    }}
                    className="block px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm font-medium"
                  >
                    Prontuário Digital
                  </a>
                </div>
              )}
              
              {/* Dropdown Menu - Mobile */}
              {isServicosDropdownOpen && (
                <div className="md:hidden mt-2 space-y-1 pl-4 border-l-2 border-blue-100">
                  <a 
                    href="/home/agenda-inteligente" 
                    onClick={() => {
                      setIsServicosDropdownOpen(false)
                      setIsOpen(false)
                    }}
                    className="block px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 text-sm font-medium"
                  >
                    Agenda Inteligente
                  </a>
                  <a 
                    href="/home/cadastro-pacientes" 
                    onClick={() => {
                      setIsServicosDropdownOpen(false)
                      setIsOpen(false)
                    }}
                    className="block px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 text-sm font-medium"
                  >
                    Cadastro de Pacientes
                  </a>
                  <a 
                    href="/home/prontuario-digital" 
                    onClick={() => {
                      setIsServicosDropdownOpen(false)
                      setIsOpen(false)
                    }}
                    className="block px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 text-sm font-medium"
                  >
                    Prontuário Digital
                  </a>
                </div>
              )}
            </div>
            
            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative search-container">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Pesquisar tópicos..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSearchResults(true)
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                
                {/* Dropdown de resultados - mostra quando está focado ou tem texto */}
                {showSearchResults && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
                    {searchQuery.trim() ? (
                      // Mostra resultados filtrados quando há texto
                      filteredResults.length > 0 ? (
                        filteredResults.map((result, index) => (
                          <button
                            key={index}
                            onClick={() => handleResultClick(result.href)}
                            className="w-full text-left px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm font-medium"
                          >
                            {result.title}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          Nenhum resultado encontrado
                        </div>
                      )
                    ) : (
                      // Mostra todas as opções quando o campo está focado e vazio
                      <>
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 uppercase">Pesquisar em:</p>
                        </div>
                        {searchableContent.map((result, index) => (
                          <button
                            key={index}
                            onClick={() => handleResultClick(result.href)}
                            className="w-full text-left px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm font-medium"
                          >
                            {result.title}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </form>
            
            {/* Search Bar - Mobile */}
            <form onSubmit={handleSearch} className="md:hidden w-full search-container mb-4 md:mb-0">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Pesquisar tópicos..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSearchResults(true)
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                
                {/* Dropdown de resultados - Mobile - mostra quando está focado ou tem texto */}
                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
                    {searchQuery.trim() ? (
                      // Mostra resultados filtrados quando há texto
                      filteredResults.length > 0 ? (
                        filteredResults.map((result, index) => (
                          <button
                            key={index}
                            onClick={() => handleResultClick(result.href)}
                            className="w-full text-left px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm font-medium"
                          >
                            {result.title}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          Nenhum resultado encontrado
                        </div>
                      )
                    ) : (
                      // Mostra todas as opções quando o campo está focado e vazio
                      <>
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 uppercase">Pesquisar em:</p>
                        </div>
                        {searchableContent.map((result, index) => (
                          <button
                            key={index}
                            onClick={() => handleResultClick(result.href)}
                            className="w-full text-left px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm font-medium"
                          >
                            {result.title}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </form>
            
            <div className="hidden md:block h-8 w-px bg-gray-200 mx-2"></div>
            
            <div className="flex gap-4 md:gap-3 flex-col md:flex-row md:items-center pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 md:border-0">
              <Link 
                href="/login" 
                className="px-5 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-all duration-200 text-base font-medium text-center mb-2 md:mb-0"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="group inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-base font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <span>Cadastre-se</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
    </>
  )
}
