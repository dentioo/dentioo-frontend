"use client"

import { Menu, Bell, User, LogOut, Clock, LayoutGrid, Users, Calendar, FileText, DollarSign, Folder, Settings, Key, Shield, ChevronLeft } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { formatTime } from "@/lib/date-utils"
// Itens de menu da sidebar para busca global
const dashboardMenuItems = [
  { href: "/dashboard/insights", label: "Insights", icon: LayoutGrid },
  { href: "/dashboard/pacientes", label: "Pacientes", icon: Users },
  { href: "/dashboard/agenda", label: "Agenda", icon: Calendar },
  { href: "/dashboard/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/dashboard/arquivos", label: "Arquivos", icon: Folder },
  { href: "/dashboard/financeiro", label: "Financeiro", icon: DollarSign },
]
const adminMenuItems = [
  { href: "/admin/trial-keys", label: "Chaves de Teste", icon: Key },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/pagamentos", label: "Pagamentos", icon: DollarSign },
]
const extraMenuItems = [
  { href: "/dashboard", label: "Minha Clínica", icon: LayoutGrid },
  { href: "/planos", label: "Meu Plano", icon: DollarSign },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
  { href: "/admin/gerenciar-admins", label: "Gerenciar Admins", icon: Shield },
]
import { useRouter } from "next/navigation"
import Link from "next/link"

interface NavbarProps {
  onMenuClick?: () => void
  userName?: string
  sidebarOpen?: boolean
}

interface Appointment {
  id: string
  patient_name: string
  start_time: string
  end_time?: string
  title?: string
  status?: string
}

export function Navbar({ onMenuClick, userName = "Usuário", sidebarOpen = true }: NavbarProps) {
  // --- Notificações e usuário ---
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'super_admin' | 'admin' | 'clinic' | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Unifica todos os itens de menu para busca
  const allMenuItems = [
    ...dashboardMenuItems,
    ...adminMenuItems,
    ...extraMenuItems,
  ];

  const filteredMenuItems = allMenuItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Função para mapear nome do plano para Edition
  const getPlanEdition = (planName: string | null, role: string | null): string => {
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'admin') return 'Admin';
    if (!planName) return 'Free Edition';
    
    const planLower = planName.toLowerCase();
    // Free plans
    if (planLower.includes('free') || planLower.includes('sem plano') || planLower === 'free') {
      return 'Free Edition';
    }
    // Starter
    if (planLower.includes('starter') || planLower === 'starter' || planLower === 'basic') {
      return 'Starter Edition';
    }
    // Professional
    if (planLower.includes('professional') || planLower === 'professional') {
      return 'Professional Edition';
    }
    // Premium
    if (planLower.includes('premium') || planLower.includes('enterprise') || planLower === 'premium') {
      return 'Premium Edition';
    }
    // Trial (pode ter diferentes tipos)
    if (planLower.includes('trial') || planLower.includes('teste')) {
      // Verificar se é trial de algum plano específico
      if (planLower.includes('starter')) return 'Starter Edition';
      if (planLower.includes('professional')) return 'Professional Edition';
      if (planLower.includes('premium')) return 'Premium Edition';
      return 'Trial Edition';
    }
    
    return planName;
  };

  useEffect(() => {
    // Pegar dados do usuário do localStorage
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        // Priorizar fullName, depois full_name, depois email
        const displayName = userData.fullName || userData.full_name || userData.email || 'Usuário';
        setUserEmail(displayName);
        
        // Detectar role
        const role = userData.role === 'super_admin' ? 'super_admin' : userData.role === 'admin' ? 'admin' : 'clinic';
        setUserRole(role);
      } catch {
        setUserEmail('Usuário');
        setUserRole('clinic');
      }
    }
  }, []);

  // Buscar dados do plano
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/trial/status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Buscar plan_name ou plan_type
          const subscription = data.data?.subscription || data.data;
          const planName = subscription?.plan_name || data.data?.plan_name || subscription?.plan_type || data.data?.plan_type || 'Sem Plano';
          setCurrentPlan(planName);
        }
      } catch (error) {
        console.error('Erro ao buscar plano na navbar:', error);
      }
    };

    fetchPlan();
  }, []);

  // Fechar notificações ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Fechar dropdown de pesquisa ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchDropdownRef.current && 
        !searchDropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const fetchTodayAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/appointments?today=true`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.data || []);
      }
    } catch (err) {
      // Erro silencioso
    } finally {
      setLoadingAppointments(false);
    }
  };


  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      fetchTodayAppointments();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-color-neutral-light h-20 flex items-center z-40 relative overflow-visible">
      <div className="flex items-center justify-between px-6 w-full relative">
        <div className="flex items-center gap-4">
          <img
            src="https://i.ibb.co/spbyHVwM/d85c195c-8521-40c3-862d-26101de8d716-Copia.png"
            alt="Logo Dentioo"
            className="h-8 w-8 mr-2 rounded-full object-cover"
          />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dentioo</h1>
          {/* Botão hambúrguer - desktop apenas, ao lado do logo */}
          <button
            onClick={() => {
              onMenuClick?.()
            }}
            className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 relative"
            aria-label="Toggle sidebar"
          >
            <div className="relative w-5 h-5">
              <Menu 
                className={`text-color-primary absolute inset-0 transition-all duration-300 ${
                  sidebarOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                }`} 
                size={20} 
              />
              <ChevronLeft 
                className={`text-color-primary absolute inset-0 transition-all duration-300 ${
                  sidebarOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                }`} 
                size={20} 
              />
            </div>
          </button>
        </div>

        {/* Barra de busca centralizada com dropdown - apenas desktop */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="w-full max-w-xl relative" ref={searchDropdownRef}>
            <svg width="16" height="16" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6z"/></svg>
            <input
              type="text"
              placeholder="Pesquisar..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-color-primary focus:border-transparent"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              ref={searchInputRef}
            />
            {/* Dropdown de resultados - mostra quando está focado ou tem texto */}
            {showDropdown && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
                {searchQuery.trim() ? (
                  // Mostra resultados filtrados quando há texto
                  filteredMenuItems.length > 0 ? (
                    filteredMenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors text-color-primary text-base cursor-pointer"
                        onClick={() => {
                          setShowDropdown(false)
                          setSearchQuery("")
                        }}
                      >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      Nenhum resultado encontrado
                    </div>
                  )
                ) : (
                  // Mostra todas as opções quando não há texto
                  <>
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 uppercase">Pesquisar em:</p>
                    </div>
                    {allMenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors text-color-primary text-base cursor-pointer"
                        onClick={() => {
                          setShowDropdown(false)
                          setSearchQuery("")
                        }}
                      >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Badge do Plano */}
          <div className="hidden sm:flex items-center">
            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
              userRole === 'super_admin' || userRole === 'admin'
                ? 'bg-purple-100 text-purple-700'
                : currentPlan && (currentPlan.toLowerCase().includes('premium') || currentPlan.toLowerCase().includes('professional') || currentPlan.toLowerCase().includes('starter'))
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {getPlanEdition(currentPlan, userRole)}
            </span>
          </div>
          
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={handleNotificationClick}
              className="relative p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              <Bell className="text-color-primary" size={20} />
              {appointments.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="fixed sm:absolute left-1/2 sm:left-auto sm:right-0 -translate-x-1/2 sm:translate-x-0 top-20 sm:top-auto sm:mt-2 bg-white rounded-lg border border-color-neutral-light shadow-lg z-50" style={{ 
                width: 'min(calc(100vw - 2rem), 320px)',
                maxWidth: '320px'
              }}>
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Consultas de Hoje</h3>
                  <p className="text-xs text-gray-500">
                    {appointments.length > 0 ? `${appointments.length} consulta(s)` : 'Nenhuma consulta'}
                  </p>
                </div>

                {loadingAppointments ? (
                  <div className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : appointments.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                      >
                        <p className="text-sm font-medium text-gray-900 mb-1">{appointment.patient_name}</p>
                        {appointment.start_time && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Clock size={14} className="text-gray-900" />
                            <span className="font-medium text-gray-900">{formatTime(appointment.start_time)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    Nenhuma consulta agendada para hoje
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative group">
            <button 
              onClick={() => {
                // No mobile, redireciona para configurações
                if (window.innerWidth < 768) {
                  router.push('/configuracoes');
                }
              }}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
            >
              <div className="w-8 h-8 bg-color-primary-dark rounded-full flex items-center justify-center">
                <User className="text-white" size={18} strokeWidth={2.5} />
              </div>
              <span className="text-sm font-medium text-color-primary hidden sm:block truncate max-w-[200px]">
                {userEmail || userName || 'Usuário'}
              </span>
            </button>

            {/* Dropdown apenas no desktop (hover) */}
            <div className="hidden md:block absolute right-0 mt-0 w-48 bg-white rounded-lg border border-color-neutral-light opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-lg">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs text-gray-500">Conectado como</p>
                <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
              </div>
              <Link
                href="/configuracoes"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Configurações
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-lg flex items-center gap-2"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>

          {/* Botão hambúrguer - mobile apenas, ao lado direito do ícone do usuário */}
          <button
            onClick={() => {
              onMenuClick?.()
            }}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 relative"
            aria-label="Toggle sidebar"
          >
            <div className="relative w-5 h-5">
              <Menu 
                className={`text-color-primary absolute inset-0 transition-all duration-300 ${
                  sidebarOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                }`} 
                size={20} 
              />
              <ChevronLeft 
                className={`text-color-primary absolute inset-0 transition-all duration-300 ${
                  sidebarOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                }`} 
                size={20} 
              />
            </div>
          </button>
        </div>
      </div>

    </nav>
          );
};
