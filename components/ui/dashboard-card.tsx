import type { ReactNode } from "react"

interface DashboardCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: "up" | "down"
  trendValue?: string
  className?: string
}

export function DashboardCard({ title, value, icon, trend, trendValue, className = "" }: DashboardCardProps) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border ${className}`} style={{ borderColor: "#d9e2ec" }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold" style={{ color: "#0d3b66" }}>
            {value}
          </p>
        </div>
        {icon && (
          <div className="text-2xl" style={{ color: "#3e92cc" }}>
            {icon}
          </div>
        )}
      </div>
      {trend && trendValue && (
        <div className="text-sm font-medium" style={{ color: trend === "up" ? "#72bda3" : "#ef4444" }}>
          {trend === "up" ? "↑" : "↓"} {trendValue}
        </div>
      )}
    </div>
  )
}
