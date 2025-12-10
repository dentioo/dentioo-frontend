"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", revenue: 4000 },
  { month: "Fev", revenue: 5200 },
  { month: "Mar", revenue: 4800 },
  { month: "Abr", revenue: 6100 },
  { month: "Mai", revenue: 7300 },
  { month: "Jun", revenue: 8500 },
]

export function RevenueChart() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-color-neutral-light">
      <h3 className="text-lg font-bold text-color-primary mb-4">Faturamento Mensal</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="month" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip
            contentStyle={{ backgroundColor: "#FFF", border: `2px solid #3E92CC` }}
            cursor={{ fill: "rgba(62, 146, 204, 0.1)" }}
            formatter={(value) => `R$ ${value.toLocaleString()}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3E92CC"
            strokeWidth={3}
            dot={{ fill: "#0D3B66", r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
