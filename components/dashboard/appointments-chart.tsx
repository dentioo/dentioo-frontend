"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { day: "Seg", appointments: 4, confirmed: 3 },
  { day: "Ter", appointments: 6, confirmed: 5 },
  { day: "Qua", appointments: 5, confirmed: 4 },
  { day: "Qui", appointments: 8, confirmed: 7 },
  { day: "Sex", appointments: 7, confirmed: 6 },
  { day: "Sab", appointments: 3, confirmed: 3 },
]

export function AppointmentsChart() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-color-neutral-light">
      <h3 className="text-lg font-bold text-color-primary mb-4">Atendimentos Semanais</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="day" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip
            contentStyle={{ backgroundColor: "#FFF", border: `2px solid #3E92CC` }}
            cursor={{ fill: "rgba(62, 146, 204, 0.1)" }}
          />
          <Legend />
          <Bar dataKey="appointments" fill="#0D3B66" radius={[8, 8, 0, 0]} />
          <Bar dataKey="confirmed" fill="#72BDA3" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
