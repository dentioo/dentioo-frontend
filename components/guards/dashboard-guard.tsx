'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          router.replace('/login');
          return;
        }

        // Verificar se é admin/super_admin - validar no backend
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'admin' || user.role === 'super_admin') {
            // Validar se é admin ativo no banco de dados
            const adminCheckResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/check-admin`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (adminCheckResponse.ok) {
              const adminData = await adminCheckResponse.json();
              if (adminData.data?.is_admin) {
                setIsAuthorized(true);
                setIsChecking(false);
                return;
              }
            }
            // Se não for admin válido, continua com verificação normal
          }
        } catch (e) {
          // Continuar com verificação normal
        }

        // Verificar se token é válido e tem trial/subscription ativa
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/trial/status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.replace('/login');
          }
          return;
        }

        const data = await response.json();
        
        // Verificar se tem trial/subscription ativa
        const isActive = data.data?.is_active || (data.data?.subscription?.status === 'active' && data.data?.subscription?.plan !== 'free')
        const status = data.data?.subscription?.status || data.data?.status
        
        if (isActive && status !== 'expired') {
          setIsAuthorized(true);
        } else {
          router.replace('/planos');
        }
        
        setIsChecking(false);
      } catch (error) {
        console.error('[DashboardGuard] Erro ao verificar autenticação:', error);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
