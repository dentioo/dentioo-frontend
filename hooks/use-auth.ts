import { useEffect, useState } from 'react'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Marca que estamos no cliente
    setIsClient(true)
    
    // Pequeno delay para garantir que localStorage está disponível
    const timer = setTimeout(() => {
      const token = localStorage.getItem('token')
      console.log('useAuth - Token disponível:', !!token)
      setIsAuthenticated(!!token)
    }, 0)
    
    return () => clearTimeout(timer)
  }, [])

  return { isAuthenticated, isClient }
}
