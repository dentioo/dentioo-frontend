'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'
import { useTrialExpirationCheck } from '@/hooks/use-trial-expiration-check'

interface CountdownTimerProps {
  endDate: string | Date | null
  onExpire?: () => void
  className?: string
}

export function CountdownTimer({ endDate, onExpire, className = '' }: CountdownTimerProps) {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    expired: boolean
  } | null>(null)

  useEffect(() => {
    if (!endDate) {
      setTimeLeft(null)
      return
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(endDate).getTime()
      const difference = end - now

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true })
        if (onExpire) {
          onExpire()
        }
        // Verificar status no backend quando timer zerar
        checkTrialStatus()
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds, expired: false })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [endDate, onExpire])

  // Calcular milliseconds restantes do endDate
  const millisecondsRemaining = endDate && !timeLeft?.expired
    ? Math.max(0, new Date(endDate).getTime() - new Date().getTime())
    : 0

  // Verificar status quando timer zerar
  useTrialExpirationCheck({
    millisecondsRemaining: millisecondsRemaining,
    isActive: !timeLeft?.expired,
    checkInterval: 5000,
  })

  const checkTrialStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/trial/status`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) return

      const data = await response.json()
      const isStillActive = data.data?.is_active || (data.data?.subscription?.status === 'active' && data.data?.subscription?.plan !== 'free')
      const status = data.data?.subscription?.status || data.data?.status

      if (!isStillActive || status === 'expired') {
        window.dispatchEvent(new CustomEvent('trial-expired'))
        router.replace('/planos')
      }
    } catch (error) {
      console.error('Erro ao verificar status do trial:', error)
    }
  }

  if (!endDate || !timeLeft) {
    return null
  }

  if (timeLeft.expired) {
    return (
      <div className={`flex items-center gap-2 text-red-600 ${className}`}>
        <Clock size={16} />
        <span className="font-semibold">Plano Expirado</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock size={16} className="text-blue-600" />
      <div className="flex items-center gap-2">
        {timeLeft.days > 0 && (
          <span className="font-semibold text-gray-900">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </span>
        )}
        {timeLeft.days === 0 && timeLeft.hours > 0 && (
          <span className="font-semibold text-gray-900">
            {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </span>
        )}
        {timeLeft.days === 0 && timeLeft.hours === 0 && (
          <span className="font-semibold text-orange-600">
            {timeLeft.minutes}m {timeLeft.seconds}s
          </span>
        )}
      </div>
    </div>
  )
}

