'use client'

import { useEffect, useState } from 'react'

type UserRole = 'clinic' | 'admin' | 'super_admin' | null

export function RoleBadge() {
  const [role, setRole] = useState<UserRole>(null)

  useEffect(() => {
    // Verificar se é admin ou clinic
    const adminAuth = localStorage.getItem('adminAuth')
    const userAuth = localStorage.getItem('user')

    if (adminAuth) {
      try {
        const auth = JSON.parse(adminAuth)
        setRole(auth.role as UserRole)
      } catch (e) {
        setRole(null)
      }
    } else if (userAuth) {
      try {
        const user = JSON.parse(userAuth)
        setRole(user.role as UserRole || 'clinic')
      } catch (e) {
        setRole('clinic')
      }
    }
  }, [])

  if (!role) return null

  const roleConfig = {
    clinic: {
      label: 'Clínica',
      color: 'bg-blue-100 text-blue-800',
      icon: '🏥',
    },
    admin: {
      label: 'Administrador',
      color: 'bg-purple-100 text-purple-800',
      icon: '👨‍💼',
    },
    super_admin: {
      label: 'Super Administrador',
      color: 'bg-red-100 text-red-800',
      icon: '👑',
    },
  }

  const config = roleConfig[role]

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  )
}
