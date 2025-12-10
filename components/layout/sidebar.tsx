"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Users, FileText, DollarSign, Settings, LayoutGrid, Folder, X, ChevronDown, Shield, Key, Search, ClipboardList } from "lucide-react"
import { useEffect, useState } from "react"
import { useActivateKeyModal } from "@/contexts/activate-key-modal"

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const dashboardMenuItems = [
  { href: "/dashboard/insights", label: "Insights", icon: LayoutGrid },
  { href: "/dashboard/pacientes", label: "Pacientes", icon: Users },
  { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  { href: "/dashboard/arquivos", label: "Arquivos", icon: Folder },
  { href: "/dashboard/prontuarios", label: "Prontuários", icon: ClipboardList },
]

const financeiroMenuItems = [
  { href: "/dashboard/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/dashboard/orcamentos", label: "Orçamentos", icon: FileText },
]

const adminMenuItems = [
  { href: "/admin/trial-keys", label: "Chaves de Teste", icon: Key },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/pagamentos", label: "Pagamentos", icon: DollarSign },
]

// Define what sections each role can see
type UserRole = 'super_admin' | 'admin' | 'clinic' | null
interface RolePermissions {
  showMinhaCl\u00ednica: boolean
  showFinanceiro: boolean
  showAdminPanel: boolean
  showMeuPlano: boolean
  showConfiguracoes: boolean
}

const getRolePermissions = (role: UserRole, isTrialActive: boolean): RolePermissions => {
  switch (role) {
    // Super Admin: vê tudo
    case 'super_admin':
      return {
        showMinhaCl\u00ednica: true,
        showFinanceiro: true,
        showAdminPanel: true,
        showMeuPlano: true,
        showConfiguracoes: true,
      }
    
    // Admin normal: vê apenas painel admin, meu plano e configurações (NÃO vê Minha Clínica)
    case 'admin':
      return {
        showMinhaCl\u00ednica: false,
        showFinanceiro: false,
        showAdminPanel: true,
        showMeuPlano: true,
        showConfiguracoes: true,
      }
    
    // Clinic users: depends on trial/plan status
    case 'clinic':
      if (isTrialActive) {
        // Trial/Premium: vê minha clínica, financeiro, meu plano e configurações
        return {
          showMinhaCl\u00ednica: true,
          showFinanceiro: true,
          showAdminPanel: false,
          showMeuPlano: true,
          showConfiguracoes: true,
        }
      } else {
        // Free/Expired: apenas meu plano e configurações
        return {
          showMinhaCl\u00ednica: false,
          showFinanceiro: false,
          showAdminPanel: false,
          showMeuPlano: true,
          showConfiguracoes: true,
        }
      }
    
    default:
      return {
        showMinhaCl\u00ednica: false,
        showFinanceiro: false,
        showAdminPanel: false,
        showMeuPlano: false,
        showConfiguracoes: false,
      }
  }
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { openModal } = useActivateKeyModal()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [financeiroDropdownOpen, setFinanceiroDropdownOpen] = useState(false)
  const [planDropdownOpen, setPlanDropdownOpen] = useState(false)
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [trialData, setTrialData] = useState<any>(null)
  const [isTrialActive, setIsTrialActive] = useState(false)
  const [isLoadingTrial, setIsLoadingTrial] = useState(true)

  // Detectar role do usuário
  useEffect(() => {
    const checkUserRole = () => {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          
          const role = user.role === 'super_admin' ? 'super_admin' : user.role === 'admin' ? 'admin' : 'clinic'
          setUserRole(role)
          setIsSuperAdmin(user.role === 'super_admin')
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Erro ao parsear usuário:', e)
          }
          setUserRole('clinic')
          setIsSuperAdmin(false)
        }
      }
    }
    
    checkUserRole()
    
    // Escutar mudanças no localStorage
    const handleStorageChange = () => {
      checkUserRole()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Verificar periodicamente (para mudanças no mesmo tab)
    const interval = setInterval(checkUserRole, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // Função para buscar plano atual
  const fetchCurrentPlan = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsLoadingTrial(false)
        return
      }

      setIsLoadingTrial(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/trial/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setCurrentPlan(data.data?.plan_name || 'Sem Plano')
        setTrialData(data.data)
        
        // Verificação mais robusta do trial ativo
        // A API pode retornar dados em data.data.subscription ou diretamente em data.data
        const subscription = data.data?.subscription || data.data
        const millisecondsRemaining = subscription?.milliseconds_remaining || data.data?.milliseconds_remaining || 0
        const plan = subscription?.plan || data.data?.plan_type || 'free'
        const status = subscription?.status || data.data?.status || 'inactive'
        const isActive = subscription?.is_active !== undefined ? subscription.is_active : data.data?.is_active
        
        // Verificar se tem trial/key ativa
        const hasActiveTrial = 
          isActive === true &&
          status !== 'expired' &&
          (
            // Para trials: precisa ter tempo restante
            (plan === 'trial' && millisecondsRemaining > 0) ||
            // Para planos pagos: status active e plan diferente de free
            (plan !== 'free' && plan !== 'trial' && status === 'active')
          )
        
        setIsTrialActive(hasActiveTrial)
      } else {
        setIsTrialActive(false)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao buscar plano:', error)
      }
      setIsTrialActive(false)
    } finally {
      setIsLoadingTrial(false)
    }
  }

  // Buscar plano atual ao montar
  useEffect(() => {
    fetchCurrentPlan()
  }, [])

  // Escutar evento de ativação de trial
  useEffect(() => {
    const handleTrialActivated = () => {
      // Aguardar um pouco para garantir que o backend atualizou
      setTimeout(() => {
        fetchCurrentPlan()
      }, 500)
    }

    // Escutar evento de expiração de trial
    const handleTrialExpired = () => {
      // Atualizar imediatamente quando expirar
      fetchCurrentPlan()
    }

    window.addEventListener('trial-activated', handleTrialActivated)
    window.addEventListener('trial-expired', handleTrialExpired)
    
    return () => {
      window.removeEventListener('trial-activated', handleTrialActivated)
      window.removeEventListener('trial-expired', handleTrialExpired)
    }
  }, [])

  const handleActivationSuccess = () => {
    // Recarregar dados do plano após ativação bem-sucedida
    setTimeout(() => {
      fetchCurrentPlan()
    }, 500)
  }

  // Formatar tempo restante
  const formatTimeRemaining = (ms: number) => {
    if (!ms || ms <= 0) return 'Expirado'
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) {
      return `${days}d ${hours}h`
    }
    return `${hours}h`
  }

  // Get permissions for current user - só mostra botões após verificar trial
  // Para usuários clinic, aguardar verificação antes de mostrar botões
  const shouldShowButtons = userRole === 'super_admin' || userRole === 'admin' || !isLoadingTrial
  const permissions = getRolePermissions(userRole, isTrialActive)

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm lg:hidden z-30" 
          onClick={onClose}
          role="presentation"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static left-0 top-0 lg:top-auto h-screen lg:h-full bg-white border-r border-color-neutral-light overflow-hidden transition-all duration-300 ease-in-out z-40 lg:z-auto flex flex-col ${
          isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:w-0 lg:border-r-0"
        }`}
      >
        <nav className="p-4 space-y-2 flex flex-col flex-1 overflow-y-auto min-h-0">
          {/* Dropdown "Minha Clínica" - apenas para super admin e clinic users com trial */}
          {shouldShowButtons && permissions.showMinhaCl\u00ednica && (
            <div>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname.startsWith("/dashboard") && dashboardMenuItems.some(item => pathname === item.href)
                    ? "bg-gray-100 text-gray-900"
                    : "text-color-primary hover:bg-gray-50"
                }`}
              >
                <LayoutGrid size={20} />
                <span className="font-medium flex-1 text-left">Minha Clínica</span>
                <ChevronDown size={18} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="mt-2 ml-4 space-y-2 border-l-2 border-color-neutral-light pl-2">
                  {dashboardMenuItems
                    .filter((item) => item.label.toLowerCase().includes(searchQuery))
                    .map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => {
                            // Fechar sidebar apenas em mobile ao clicar em link
                            if (window.innerWidth < 1024 && onClose) {
                              onClose()
                            }
                          }}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                            isActive
                              ? "bg-blue-100 text-gray-900 font-medium"
                              : "text-color-primary hover:bg-gray-50"
                          }`}
                        >
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </Link>
                      )
                    })}
                </div>
              )}
            </div>
          )}

          {/* Dropdown "Financeiro" - apenas para super admin e clinic users com trial */}
          {shouldShowButtons && permissions.showFinanceiro && (
            <div>
              <button
                onClick={() => setFinanceiroDropdownOpen(!financeiroDropdownOpen)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname.startsWith("/dashboard") && financeiroMenuItems.some(item => pathname === item.href)
                    ? "bg-gray-100 text-gray-900"
                    : "text-color-primary hover:bg-gray-50"
                }`}
              >
                <DollarSign size={20} />
                <span className="font-medium flex-1 text-left">Financeiro</span>
                <ChevronDown size={18} className={`transition-transform ${financeiroDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {financeiroDropdownOpen && (
                <div className="mt-2 ml-4 space-y-2 border-l-2 border-color-neutral-light pl-2">
                  {financeiroMenuItems
                    .filter((item) => item.label.toLowerCase().includes(searchQuery))
                    .map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => {
                            // Fechar sidebar apenas em mobile ao clicar em link
                            if (window.innerWidth < 1024 && onClose) {
                              onClose()
                            }
                          }}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                            isActive
                              ? "bg-blue-100 text-gray-900 font-medium"
                              : "text-color-primary hover:bg-gray-50"
                          }`}
                        >
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </Link>
                      )
                    })}
                </div>
              )}
            </div>
          )}

          {/* Dropdown "Meu Plano" - para TODOS os usuários */}
          {permissions.showMeuPlano && (
            <div>
              <button
                onClick={() => setPlanDropdownOpen(!planDropdownOpen)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  planDropdownOpen
                    ? "bg-amber-100 text-gray-900"
                    : "text-amber-600 hover:bg-amber-50"
                }`}
              >
                <DollarSign size={20} />
                <span className="font-medium flex-1 text-left">Meu Plano</span>
                <span className={`text-xs px-2 py-1 rounded-full truncate max-w-[100px] font-medium ${
                  userRole === 'super_admin' || userRole === 'admin' 
                    ? "bg-purple-200 text-purple-900" 
                    : "bg-amber-200 text-amber-900"
                }`}>
                  {userRole === 'super_admin' ? 'Super Admin' : userRole === 'admin' ? 'Admin' : (currentPlan || 'Carregando...')}
                </span>
                <ChevronDown size={18} className={`transition-transform ${planDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Plan Dropdown Menu */}
              {planDropdownOpen && (
                <div className="mt-2 ml-4 p-3 border-l-2 border-amber-300 pl-2 space-y-3 relative z-50">
                  {/* Status Administrativo (para admins) */}
                  {(userRole === 'admin' || userRole === 'super_admin') && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 mb-2">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Status Administrativo</p>
                      <p className="text-sm font-bold text-purple-900">{userRole === 'super_admin' ? 'Super Administrador' : 'Administrador'}</p>
                    </div>
                  )}

                  {/* Plano Atual (para clinic users) */}
                  {userRole === 'clinic' && (
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs font-semibold text-gray-600">Plano Atual</p>
                          <p className="text-sm font-bold text-gray-900">{currentPlan}</p>
                        </div>
                        {trialData?.is_active && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Ativo</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        <p>
                          Tempo: <span className="font-semibold text-gray-900">
                            {trialData?.milliseconds_remaining 
                              ? formatTimeRemaining(trialData.milliseconds_remaining)
                              : '0'
                            }
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Botão Ativar Chave - apenas para clinic users */}
                  {userRole === 'clinic' && (
                    <button
                      onClick={openModal}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium"
                    >
                      <Key size={16} />
                      Ativar Chave
                    </button>
                  )}

                  {/* Separator */}
                  <div className="border-t border-amber-200 pt-2">
                    <Link
                      href="/planos"
                      onClick={() => {
                        // Fechar sidebar apenas em mobile ao clicar em link
                        if (window.innerWidth < 1024 && onClose) {
                          onClose()
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 transition text-sm font-medium"
                    >
                      Ver Todos os Planos
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dropdown "Painel Administrativo" - apenas para admins e super_admin */}
          {permissions.showAdminPanel && (
            <div>
              <button
                onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname.startsWith("/admin") && !adminMenuItems.some(item => pathname === item.href)
                    ? "bg-purple-100 text-gray-900"
                    : "text-purple-600 hover:bg-purple-50"
                }`}
              >
                <Shield size={20} />
                <span className="font-medium flex-1 text-left">Painel Administrativo</span>
                <ChevronDown size={18} className={`transition-transform ${adminDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Admin Dropdown Menu */}
              {adminDropdownOpen && (
                <div className="mt-2 ml-4 space-y-2 border-l-2 border-purple-300 pl-2">
                  {adminMenuItems
                    .filter((item) => item.label.toLowerCase().includes(searchQuery))
                    .map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => {
                            // Fechar sidebar apenas em mobile ao clicar em link
                            if (window.innerWidth < 1024 && onClose) {
                              onClose()
                            }
                          }}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                            isActive
                              ? "bg-purple-100 text-gray-900 font-medium"
                              : "text-purple-600 hover:bg-purple-50"
                          }`}
                        >
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </Link>
                      )
                    })}

                  {/* Opção de gerenciar admins - apenas para super admin */}
                  {isSuperAdmin && (
                    <Link
                      href="/admin/gerenciar-admins"
                      onClick={() => {
                        // Fechar sidebar apenas em mobile ao clicar em link
                        if (window.innerWidth < 1024 && onClose) {
                          onClose()
                        }
                      }}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                        pathname === "/admin/gerenciar-admins"
                          ? "bg-purple-100 text-gray-900 font-medium"
                          : "text-purple-600 hover:bg-purple-50"
                      }`}
                    >
                      <Shield size={16} />
                      <span>Gerenciar Admins</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Botão de Configurações - no final */}
          {permissions.showConfiguracoes && (
            <div className="mt-auto border-t border-color-neutral-light pt-4">
              <Link
                href="/configuracoes"
                onClick={() => {
                  // Fechar sidebar apenas em mobile ao clicar em link
                  if (window.innerWidth < 1024 && onClose) {
                    onClose()
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === "/configuracoes"
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-color-primary hover:bg-gray-50"
                }`}
              >
                <Settings size={20} />
                <span className="font-medium">Configurações</span>
              </Link>
            </div>
          )}
        </nav>
      </aside>
    </>
  )
}
